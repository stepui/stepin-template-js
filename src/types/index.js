export function isResponse(obj) {
  return (
    typeof obj === 'object' &&
    obj.message !== undefined &&
    obj.code !== undefined
  );
}
