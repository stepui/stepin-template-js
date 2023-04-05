const modules = import.meta.glob('./**/*.{js,vue}');
const Pages = Object.entries(modules).reduce((r, [key, _module]) => {
  key = key.replace(/^.\//, '@/pages/');
  r[key] = _module;
  if (/\/index.(js|jsx|vue)/.test(key)) {
    r[key.replace(/\/index.(js|jsx|vue)/, '')] = _module;
  }
  return r;
}, {});
export default Pages;
