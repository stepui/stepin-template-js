import { watch, computed, ref } from 'vue';
function useModelValue(value, onChange, defaultValue) {
  const _value = ref();
  _value.value = value() ?? defaultValue;
  const sValue = computed({
    get() {
      return value() ?? _value.value;
    },
    set(val) {
      _value.value = val;
      onChange(val);
    },
  });
  watch(value, () => {
    _value.value = value();
  });
  return { value: sValue };
}
export default useModelValue;
