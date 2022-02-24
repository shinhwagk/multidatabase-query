FROM shinhwagk/python:oracle-18.5

EXPOSE 8000
WORKDIR /app
RUN pip install cx_Oracle==8.3.0 fastapi==0.74.1 uvicorn[standard]==0.17.5
COPY main.py .

CMD uvicorn main:app --host 0.0.0.0