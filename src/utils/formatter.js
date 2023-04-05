/**
 * 格式化金额
 * @param value
 * @param fixed
 * @returns
 */
export function formatMoney(value, fixed = 0) {
  let unit = value < 10000 ? '' : value < 100000000 ? 'w' : '亿';
  value =
    value < 10000
      ? value
      : value < 100000000
      ? value / 10000
      : value / 100000000;
  let format = value.toFixed(fixed);
  const _val = format.split('.');
  const _int = _val[0],
    _dec = _val[1];
  return `${_val}${unit}`;
}
/**
 * 千位格式化
 * @param value
 * @param fixed
 * @returns
 */
export function formatThousand(value, fixed = 0) {
  const _val = value.toFixed(fixed).split('.');
  let [_int, _dec] = _val;
  _dec = parseInt(_dec) === 0 ? undefined : _dec;
  let numbers = [];
  let format = '';
  for (let i = _int.length; i >= 0; i -= 3) {
    numbers.push(_int.substring(i - 3 < 0 ? 0 : i - 3, i));
  }
  return numbers.reverse().join(',') + ((_dec && `.${_dec}`) ?? '');
}
