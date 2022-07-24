
# multidatabase 
```yaml
version: "3.4"

services:
  multidatabase-query:
    <<: *log
    image: shinhwagk/multidatabase:v0.2.11
    restart: "on-failure"
    deploy:
      replicas: 2
    environment:
      EXECUTE_TIMEOUT: 60000
      ORACLE_USERPASS: oracle_exporter:oracle_exporter
```
