import logging
import os
from datetime import datetime

import cx_Oracle

EXECUTE_TIMEOUT = os.getenv('EXECUTE_TIMEOUT', '10000')


class Database:
    def __init__(self, username, password, dsn) -> None:
        self.last = datetime.now()
        self._con_pool = cx_Oracle.SessionPool(user=username,
                                               password=password,
                                               dsn=dsn,
                                               min=1,
                                               max=20,
                                               increment=1,
                                               timeout=60,
                                               encoding="UTF-8",
                                               getmode=cx_Oracle.SPOOL_ATTRVAL_WAIT)

    def close(self):
        try:
            self._con_pool.close()
        except cx_Oracle.Error as err:
            logging.error('database -> close connect pool error: {}'.format(str(err)))

    def __col_type_proc(self, col_type, col_value):
        # process clob type
        if col_type in (cx_Oracle.DB_TYPE_VARCHAR, cx_Oracle.DB_TYPE_DATE, cx_Oracle.DB_TYPE_NUMBER):
            return col_value
        elif col_type == cx_Oracle.DB_TYPE_RAW:
            # v$sql_shared_cursor.ADDRESS
            # v$sql_shared_cursor.CHILD_ADDRESS
            # bytes to hex
            return col_value.hex()
        elif col_type == cx_Oracle.DB_TYPE_CLOB:
            return col_value.read()
        else:
            raise Exception(f'colume type {str(col_type)} not processed.',)

    def __row_factory(self, cur):
        col_descs = cur.description

        def func(*args):
            col_values = []
            col_names = [col[0] for col in col_descs]
            for idx in range(len(cur.description)):
                ct = col_descs[idx][1]
                col_values.append(self.__col_type_proc(ct, args[idx]))
            return dict(zip(col_names, col_values))
        return func

    def query(self, sql_text: str, binds=tuple()):
        try:
            con = self._con_pool.acquire()
            con.callTimeout = int(EXECUTE_TIMEOUT)  # milliseconds
            with con.cursor() as cur:
                cur.execute(sql_text, tuple(binds))
                cur.rowfactory = self.__row_factory(cur)
                return cur.fetchall()
        finally:
            self.last = datetime.now()
            self._con_pool.release(con)
