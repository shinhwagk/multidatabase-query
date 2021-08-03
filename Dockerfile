FROM shinhwagk/python:oracle

RUN pip install python-consul2
WORKDIR /app
COPY main.py .

CMD python /app/main.py