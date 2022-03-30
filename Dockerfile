FROM python:3.10-slim as oraclelib

ADD https://download.oracle.com/otn_software/linux/instantclient/185000/instantclient-basic-linux.x64-18.5.0.0.0dbru.zip /tmp/

RUN apt update && apt install -y unzip && \
    mkdir -p /opt/oracle/ && \
    unzip /tmp/instantclient-basic-linux.x64-18.5.0.0.0dbru.zip -d /opt/oracle/

FROM python:3.10-slim

COPY --from=oraclelib /opt/oracle /opt/oracle

RUN apt update && apt install -y libaio1 && \
    sh -c "echo /opt/oracle/instantclient_18_5 > /etc/ld.so.conf.d/oracle-instantclient.conf" && \
    ldconfig && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_18_5

EXPOSE 5000

RUN pip install cx_Oracle==8.3.0 fastapi==0.75.0 uvicorn[standard]==0.17.6

WORKDIR /app
COPY main.py database.py database_pool.py .

CMD python main.py