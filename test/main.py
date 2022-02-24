import asyncio

from fastapi import FastAPI

app = FastAPI()


async def count():
    print("One")
    await asyncio.sleep(5)
    return ['1']


@app.get('/')
async def read_results():
    results = await count()
    return results
