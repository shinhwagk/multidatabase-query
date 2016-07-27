/**
 * Created by zhangxu on 2016/7/20.
 */
export function getTimeString() {
  function leading_zero_0(a) {
    return a < 10 ? "0" + a : a
  }

  function leading_zero_00(a) {
    if (a < 10) {
      return "00" + a
    } else if (a < 100) {
      return "0" + a
    } else {
      return a
    }
  }

  var d, s = "";
  d = new Date();
  s += d.getFullYear();
  s += leading_zero_0(d.getMonth() + 1);
  s += leading_zero_0(d.getDate());
  s += leading_zero_0(d.getHours());
  s += leading_zero_0(d.getMinutes());
  s += leading_zero_0(d.getSeconds());
  s += leading_zero_00(d.getMilliseconds());
  return s
}

export function extractObjectKeys(obj) {
  let keys:string[] = []
  for (let k in obj) {
    keys.push(k)
  }
  return keys
}
