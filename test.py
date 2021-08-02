import main
import time

dp = main.DatabasePool()

while True:
    r = dp.query('z11', 'select * from dual')
    print(r)
    time.sleep(7)
