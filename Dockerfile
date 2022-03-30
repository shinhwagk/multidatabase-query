FROM python:3.10-slim

RUN apt update && apt install -y libaio1 unzip curl && \
    curl -o /tmp/instantclient-basic-linux.x64-18.5.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/185000/instantclient-basic-linux.x64-18.5.0.0.0dbru.zip && \
    mkdir -p /opt/oracle/ && \
    unzip /tmp/instantclient-basic-linux.x64-18.5.0.0.0dbru.zip -d /opt/oracle/instantclient_18_5 && \
    rm -f /tmp/instantclient-basic-linux.x64-18.5.0.0.0dbru.zip && \
    sh -c "echo /opt/oracle/instantclient_18_5 > /etc/ld.so.conf.d/oracle-instantclient.conf" && \
    ldconfig && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_18_5:$LD_LIBRARY_PATH

EXPOSE 5000

RUN pip install cx_Oracle==8.3.0 fastapi==0.75.0 uvicorn[standard]==0.17.6

WORKDIR /app
COPY main.py database.py database_pool.py .

CMD python main.py