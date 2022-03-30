import logging
import os

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

from database_pool import DatabasePool

EXECUTE_TIMEOUT = os.getenv('EXECUTE_TIMEOUT', '10000')
ALLOW_COMMANDS = os.getenv('ALLOW_COMMANDS', 'select')
ORACLE_USERPASS = os.getenv('ORACLE_USERPASS')
if ORACLE_USERPASS is None:
    raise Exception('env ORACLE_USERPASS no set.')


logging.basicConfig(level=logging.INFO)


class QueryParams(BaseModel):
    dsn: str
    sql_text: str
    binds = tuple()


app = FastAPI()

username, password = ORACLE_USERPASS.split(':')
db_pool = DatabasePool(username=username, password=password, cleaning=True)


@app.post("/query")
def query(params: QueryParams):
    result = db_pool.query(**params.dict())
    return result


@app.get("/check")
def check():
    return None


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, log_level="info")
