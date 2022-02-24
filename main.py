import base64
import json
import logging
import os
import re
import threading
import time
from datetime import datetime, timedelta

import cx_Oracle
from fastapi import FastAPI
from pydantic import BaseModel


def get_logger():
    FORMAT = '%(asctime)s :: %(levelname)s :: %(message)s'
    logging.basicConfig(format=FORMAT)
    logger = logging.getLogger('multidatabase')
    logger.setLevel(logging.INFO)
    return logger


logger = get_logger()

EXECUTE_TIMEOUT = os.getenv('EXECUTE_TIMEOUT', '10000')
ALLOW_COMMANDS = os.getenv('ALLOW_COMMANDS', 'select')


class DatabasePool:
    # { 'con': '', 'last': datetime}
    __db_pool = dict()

    def __init__(self) -> None:
        threading.Thread(target=self.__close_long_unused_dbobj).start()

    def __gen_db_id(self, user: str, dsn: str) -> str:
        return f"{user}@{dsn}"

    def __get_db_obj(self, username: str, password: str, dsn: str):
        db_id = self.__gen_db_id(username, dsn)
        if db_id not in list(self.__db_pool):
            self.__create_con_pool(username, password, dsn)
        return self.__db_pool.get(db_id)

    def __col_type_proc(self, colType, colValue):
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
                colValues.append(self.__col_type_proc(ct, args[idx]))
            return dict(zip(colNames, colValues))
        return func

    def __restrict_sqltext_command(self, sqlText) -> bool:
        for cmd in [c.strip() for c in ALLOW_COMMANDS.split(',')]:
            if re.match(rf'(?i)^\s*{cmd}', sqlText) is not None:
                return True
        return False
        # return False if re.match(rf'(?i)^\s*{}', sqlText) is None else True

    def __exception_proc(self, exc: cx_Oracle.Error, db_id: str = None):
        error, = exc.args
        if hasattr(error, "code") and error.code == 'DPI-1010':
            self.__closePool(db_id)
            print("Oracle-Error-Code:", error.code)
            print("Oracle-Error-Message:", error.message)
    # param sql_text 名字必须是sql_text 因为他和请求参数一致

    def query(self, userpass: str, dsn: str, sql_text: str, binds=tuple()):
        # code 1 is error, 0 is success.
        user, password = userpass.split(':')
        db_id = self.__gen_db_id(user, dsn)
        result = {'code': 1, 'result': [], 'error': "", 'dsn': dsn}
        if not self.__restrict_sqltext_command(sql_text):
            result['error'] = f'sql_text only allow [{ALLOW_COMMANDS}]'
            return result
        try:
            dbobj = self.__get_db_obj(user, password, dsn)
            logger.info("%s __getDBObj", db_id)
            if dbobj is None:
                result['error'] = 'datasource not exist.'
                logger.error("datasource not exist.")
            else:
                con = dbobj['pool'].acquire()
                logger.info("%s start  query", db_id)
                st = datetime.now()
                con.callTimeout = int(EXECUTE_TIMEOUT)  # milliseconds
                try:
                    with con.cursor() as cur:
                        cur.execute(sql_text, tuple(binds))
                        cur.rowfactory = self.__rowfactory(cur)
                        result['code'] = 0
                        result['result'] = cur.fetchall()
                    dbobj['last'] = datetime.now()
                except Exception as e:
                    self.__exception_proc(e, db_id)
                    raise
                finally:
                    dbobj['pool'].release(con)
                logger.info("%s end query", db_id)
                et = datetime.now() - st
                logger.info("%s release conn", db_id)
                logger.info("db_id: %s :: %s", db_id, f'query :: elapsed_time: {et}, sql_text: {base64.b64encode(sql_text.encode())}, binds:{json.dumps(binds)}.')
        except Exception as e:
            result['error'] = str(e)
            logger.error("db_id: %s :: %s", db_id, f'{str(e)}, sql_text: {base64.b64encode(sql_text.encode())}, binds:{json.dumps(binds)}')

        return result

    def __closePool(self, db_id):
        do = self.__db_pool.get(db_id)
        if do is not None:
            try:
                do['pool'].close()
            except Exception as e:
                logger.error("db_id: %s :: %s", db_id, f'{str(e)}')

    def __close_long_unused_dbobj(self):
        while True:
            time.sleep(60)
            logger.info('%s :: %s', "system", "try remove long time unused the session pool.")
            for db_id in list(self.__db_pool):
                do = self.__db_pool.get(db_id)
                if do is not None:
                    last_time = do['last']
                    if last_time + timedelta(minutes=10) <= datetime.now():
                        try:
                            do['pool'].close()
                        except Exception as e:
                            self.__exception_proc(e, db_id)
                            logger.error('%s :: %s', "system", f"db_id: {db_id} :: {str(e)}.")
                        finally:
                            del self.__db_pool[db_id]
                        logger.info('%s :: %s', "system", f"db_id: {db_id} removed from database pool.")

    def __create_con_pool(self, username, password, dsn):
        db_id = self.__gen_db_id(username, dsn)
        try:
            logger.info('%s :: %s', f"db_id: {db_id}", "create session pool to database pool.")
            con_pool = cx_Oracle.SessionPool(user=username, password=password, dsn=dsn, min=1, max=20, increment=1, timeout=60, encoding="UTF-8", getmode=cx_Oracle.SPOOL_ATTRVAL_WAIT)
            self.__db_pool[db_id] = {'pool': con_pool, 'last': datetime.now()}
        except Exception as e:
            self.__exception_proc(e, db_id)
            raise


class QueryParams(BaseModel):
    userpass: str
    dsn: str
    sql_text: str
    binds = tuple()


app = FastAPI()
dbPool = DatabasePool()


@app.post("/query")
def query(params: QueryParams):
    print(params)
    result = dbPool.query(**params.dict())
    return result


@app.get("/check")
def check():
    return None
