import socket
import sys

import requests

CONSUL_ADDR = os.getenv('CONSUL_ADDR')

hostname = socket.gethostname()
data = {"name": "multidatabasece-oracle", "id": hostname, "address": hostname, "port": 8000,
        "checks": [{"http": f"http://{hostname}:8000/", "interval": "10s"}]}
res = requests.put(f'http://{CONSUL_ADDR}/v1/agent/service/register', json=data)
if res.status_code != 200:
    print(res.text())
    sys.exit(1)
