FROM shinhwagk/python:oracle


WORKDIR /app
COPY main.py .
COPY ds.json .

CMD python /app/main.py