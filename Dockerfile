FROM shinhwagk/python:oracle-18.5

EXPOSE 5000

RUN pip install cx_Oracle==8.3.0 fastapi==0.75.0 uvicorn[standard]==0.17.6

WORKDIR /app
COPY main.py database.py database_pool.py .

CMD python main.py