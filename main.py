import json
import threading

import cx_Oracle


class ConPool:
    cons = dict({'id': '', 'con': '', 'cdate': ''})

    def getConn(self, id: str):
        if id not in self.cons.keys():
            self.createCon(id)
        return self.cons[id]

    def query(self, id, sql_text, binds: list[any]):
        con = self.getConn(id)
        result = {'code': 0, 'result': [], 'error': ""}
        with con.cursor() as cur:
            try:
                cur.execute(sql_text, binds)
                cur.rowfactory = lambda *args: dict(zip([d[0] for d in cur.description], args))
                for row in cur.fetchall():
                    print(row)
            except Exception as e:
                result['code'] = 1
                result['error'] = str(e)
        return result

    def createCon(self, id):
        ds = self.readDss()[id]
        user = ds['user']
        password = ds['password']
        dsn = ds['dsn']
        self.cons[id] = cx_Oracle.SessionPool(user=user, password=password, dsn=dsn, min=1, max=2, increment=1, encoding="UTF-8")

    def readDss(self):
        with open('ds.json', 'r') as f:
            return json.load(f)


class SampleQueryApi:
    pass
