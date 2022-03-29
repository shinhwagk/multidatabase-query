import base64
import logging
import re
import threading
import time
from datetime import datetime, timedelta

from database import Database

# ALLOW_COMMANDS = os.getenv('ALLOW_COMMANDS', 'select')
ALLOW_COMMANDS = 'select'


class DatabasePool:
    # db_id, db, last
    db_pool: dict[str, Database] = dict()

    def __init__(self, username, password, cleaning=False) -> None:
        self.__username = username
        self.__password = password
        if cleaning:
            threading.Thread(target=self.__close_long_unused_db).start()

    def __gen_db_id(self, dsn: str) -> str:
        return f"{self.__username}@{dsn}"

    def __get_db(self, dsn: str) -> Database | None:
        db_id = self.__gen_db_id(dsn)
        if db_id not in list(self.db_pool):
            self.__create_db(dsn)
        return self.db_pool.get(db_id)

    # def __exception_proc(self, exc: cx_Oracle.Error, db_id: str = None):
    #     error, = exc.args
    #     if hasattr(error, "code") and error.code == 'DPI-1010':
    #         self.__close_db(db_id)
    #         print("Oracle-Error-Code:", error.code)
    #         print("Oracle-Error-Message:", error.message)

    def __close_long_unused_db(self):
        while True:
            time.sleep(60)
            # logging.info('%s :: %s', "system", "try remove long time unused the session pool.")
            for db_id in list(self.db_pool):
                db = self.db_pool.get(db_id)
                if db is not None:
                    if db.last + timedelta(minutes=10) <= datetime.now():
                        try:
                            db.close()
                        except Exception as err:
                            # self.__exception_proc(err, db_id)
                            logging.error('%s :: %s', "system", f"db_id: {db_id} :: {str(err)}.")
                        finally:
                            del self.db_pool[db_id]
                        logging.info('%s :: %s', "system", f"db_id: {db_id} removed from database pool.")

    def __create_db(self, dsn: str):
        db_id = self.__gen_db_id(dsn)
        logging.info('%s :: %s', f"db_id: {db_id}", "create session pool to database pool.")
        self.db_pool[db_id] = Database(self.__username, self.__password, dsn)

    def __restrict_sqltext_command(self, sql_text) -> bool:
        for cmd in [c.strip() for c in ALLOW_COMMANDS.split(',')]:
            if re.match(rf'(?i)^\s*{cmd}', sql_text) is not None:
                return True
        return False

    def query(self, dsn: str, sql_text: str, binds=tuple()):
        result = {'code': 1, 'result': [], 'error': ""}
        logging.info("database pool -> query -> dsn: {}, sql_text: {}, binds: {}".format(dsn, base64.b64encode(sql_text.encode()), binds))
        if not self.__restrict_sqltext_command(sql_text):
            result['error'] = f'sql_text only allow execute [{ALLOW_COMMANDS}]'
            logging.error("database pool -> query -> dsn: {}, sql_text: {}, binds: {}, error: {}.".format(dsn, base64.b64encode(sql_text.encode()), binds, 'sql_text only allow execute [select]'))
        else:
            try:
                db = self.__get_db(dsn)
                if db is None:
                    # return {'code': 1, 'result': [], 'error': 'con error'}
                    result['error'] = 'con error'
                else:
                    result['result'] = db.query(sql_text, binds)
                    result['code'] = 0
            except Exception as err:
                result['error'] = str(err)
                logging.error("database pool -> query -> dsn: {}, sql_text: {}, binds: {}, error: {}.".format(dsn, base64.b64encode(sql_text.encode()), binds, str(err)))
        return result
