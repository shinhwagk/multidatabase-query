FROM shinhwagk/python:oracle-18.5

RUN pip install requests
WORKDIR /app
COPY main.py .

CMD python /app/main.py