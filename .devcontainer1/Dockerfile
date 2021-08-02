# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.187.0/containers/python-3/.devcontainer/base.Dockerfile

# [Choice] Python version: 3, 3.9, 3.8, 3.7, 3.6
ARG VARIANT="3.9"
FROM mcr.microsoft.com/vscode/devcontainers/python:0-${VARIANT}

# [Option] Install Node.js
ARG INSTALL_NODE="true"
ARG NODE_VERSION="lts/*"
RUN if [ "${INSTALL_NODE}" = "true" ]; then su vscode -c "umask 0002 && . /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} 2>&1"; fi

RUN mkdir -p /opt/oracle
COPY instantclient_11_2 /opt/oracle/instantclient_11_2

RUN cd /opt/oracle/instantclient_11_2 ; \
    ln -s libclntsh.so.11.1 libclntsh.so; \
    ln -s libocci.so.11.1 libocci.so

RUN sed -i 's/deb\.debian\.org/mirrors\.aliyun\.com/' /etc/apt/sources.list; \
    sed -i 's/security\.debian\.org/mirrors\.aliyun\.com/' /etc/apt/sources.list

USER root
RUN apt update && apt install -y libaio1 && \
    sh -c "echo /opt/oracle/instantclient_11_2 > /etc/ld.so.conf.d/oracle-instantclient.conf" && \
    ldconfig
USER vscode

ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_11_2:$LD_LIBRARY_PATH


