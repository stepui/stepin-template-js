/**
 * 初始化目标值为 undefined 的属性
 * @param target 目标对象
 * @param dft 默认值对象
 */
export function initUndefined(target, dft) {
  Object.keys(dft).forEach((key) => (target[key] = target[key] ?? dft[key]));
}
