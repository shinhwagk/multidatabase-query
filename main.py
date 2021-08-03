import base64
import gzip
import json
import logging
import os
import re
import socket
import threading
import time
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, HTTPServer

import cx_Oracle

from consul import Consul


def get_logger():
    FORMAT = '%(asctime)s :: %(levelname)s :: %(message)s'
    logging.basicConfig(format=FORMAT)
    logger = logging.getLogger('multidatabase')
    logger.setLevel(logging.INFO)
    return logger


logger = get_logger()


class DatabasePool:
    # { 'con': '', 'last': datetime}
    __dbObjs = dict()

    def __init__(self) -> None:
        threading.Thread(target=self.__closeLongUnusedDBObj).start()

    def __getDBObj(self, db_id: str):
        if db_id not in self.__dbObjs.keys():
            self.__createConPool(db_id)
        return self.__dbObjs.get(db_id)

    def __colTypeProc(self, colType, colValue):
        # 特殊处理CLOB类型
        if colType in (cx_Oracle.DB_TYPE_VARCHAR, cx_Oracle.DB_TYPE_DATE, cx_Oracle.DB_TYPE_NUMBER):
            return colValue
        elif colType == cx_Oracle.DB_TYPE_RAW:
            # v$sql_shared_cursor.ADDRESS
            # v$sql_shared_cursor.CHILD_ADDRESS
            # 上面这两个用bytes to hex 可以正常使用
            return colValue.hex()
        elif colType == cx_Oracle.DB_TYPE_CLOB:
            return colValue.read()
        else:
            raise Exception(f'colume type {str(colType)} not processed.',)

    def __rowfactory(self, cur):
        colDescs = cur.description

        def func(*args):
            colValues = []
            colNames = [col[0] for col in colDescs]
            for idx in range(len(cur.description)):
                ct = colDescs[idx][1]
                colValues.append(self.__colTypeProc(ct, args[idx]))
            return dict(zip(colNames, colValues))
        return func

    def __restrictSqlTextType(self, sqlText) -> bool:
        return False if re.match(r'(?i)^\s*select', sqlText) is None else True

    # param sql_text 名字必须是sql_text 因为他和请求参数一致
    def query(self, db_id, sql_text: str, binds=()):
        # code 1 is error, 0 is success.
        result = {'code': 1, 'result': [], 'error': "", 'db_id': db_id}
        if self.__restrictSqlTextType(sql_text):
            try:
                dbObj = self.__getDBObj(db_id)
                if dbObj is None:
                    result['error'] = 'datasource not exist.'
                    logger.error("datasource not exist.")
                else:
                    conPool = dbObj['pool']
                    con = conPool.acquire()
                    dbObj['last'] = datetime.now()
                    st = datetime.now()
                    with con.cursor() as cur:
                        cur.execute(sql_text, binds)
                        cur.rowfactory = self.__rowfactory(cur)
                        result['code'] = 0
                        result['result'] = cur.fetchall()
                    et = datetime.now() - st
                    conPool.release(con)
                    logger.info("db_id: %s :: %s", db_id, f'query :: elapsed_time: {et}, sql_text: {base64.b64encode(sql_text.encode())}, binds:{json.dumps(binds)}.')
            except Exception as e:
                result['error'] = str(e)
                logger.error("db_id: %s :: %s", db_id, f'{str(e)}, sql_text: {base64.b64encode(sql_text.encode())}, binds:{json.dumps(binds)}')
        else:
            result['error'] = 'sql_text only suppet [select]'
        return result

    def __closeLongUnusedDBObj(self):
        while True:
            time.sleep(60)
            logger.info('%s :: %s', "system", f"try remove long time unused the session pool.")
            for db_id in list(self.__dbObjs):
                do = self.__dbObjs.get(db_id)
                if do is not None:
                    lastTime = do['last']
                    if lastTime + timedelta(minutes=10) <= datetime.now():
                        conPool = do['pool']
                        conPool.close()
                        del self.__dbObjs[db_id]
                        logger.info('%s :: %s', "system", f"db_id: {db_id} removed from database pool.")

    def __createConPool(self, db_id):
        logger.info('%s :: %s', f"db_id: {db_id}", "create session pool to database pool.")
        ds = self.__readDss()[db_id]
        user = ds['user']
        password = ds['password']
        dsn = ds['dsn']
        conPool = cx_Oracle.SessionPool(user=user, password=password, dsn=dsn, min=1, max=2, increment=1, timeout=10, encoding="UTF-8")
        self.__dbObjs[db_id] = {'pool': conPool, 'last': datetime.now()}

    def __readDss(self):
        ch = os.getenv('CONSUL_HOST')
        cp = os.getenv('CONSUL_PORT')
        cs = os.getenv('CONSUL_SERVICES')

        if ch is not None and cp is not None and cs is not None:
            dss = {}
            c = Consul(host=ch, port=cp)
            v = c.kv.get(f'database/oracle/userpass/multidatabase', index=None)
            user, password = v[1]['Value'].decode('utf-8').split(':')
            for s in cs.split(','):
                (_, services) = c.catalog.service(s)
                for _s in services:
                    sm = _s['ServiceMeta']
                    db_id = sm['db_id']
                    db_ip = sm['db_ip']
                    db_port = sm['db_port']
                    db_sn = sm['db_sn']
                    dss[db_id] = {
                        "user": user,
                        "password": password,
                        "dsn": f"{db_ip}:{db_port}/{db_sn}"
                    }
            return dss
        elif os.path.exists('ds.json'):
            with open('dss.json', 'r') as f:
                return json.load(f)
        else:
            return {}


class MultidatabaseHandler(BaseHTTPRequestHandler):
    """
    BaseHTTPRequestHandler 不是并发的，在这里也不需要，如果需要并发交给nginx lb或者docker-compose内部轮巡
    """
    dbPool = DatabasePool()

    def gzip_encode(self, content: bytes):
        return gzip.compress(content)

    def do_POST(self):
        try:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('os-hostname', socket.gethostname())
            self.send_header('content-encoding', 'gzip')
            self.end_headers()
            queryParams = self.rfile.read(int(self.headers.get('Content-Length', 0)))
            reqObj = json.loads(queryParams)

            if self.path == '/query':
                result = self.dbPool.query(**reqObj)
                data = self.gzip_encode(json.dumps(result).encode('utf-8'))
                self.wfile.write(data)
                self.wfile.flush()
            elif self.path == '/register':
                # todo
                pass
            else:
                self.wfile.write(bytes(json.dumps({'status': "no service"})))
        except Exception as e:
            self.wfile.close()
            print("http error", e)

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        if self.path == '/check':
            # todo
            pass
        self.wfile.write(bytes(json.dumps({'status': 'ok'}), "utf8"))


class MultidatabaseQueryService:
    def start(self):
        with HTTPServer(('', 8000), MultidatabaseHandler) as server:
            logger.info('system :: MultidatabaseQueryService started, port 8000.')
            server.serve_forever()


if __name__ == "__main__":
    MultidatabaseQueryService().start()
