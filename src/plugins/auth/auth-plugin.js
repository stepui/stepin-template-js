import { defineStore } from 'pinia';
import './auth.css';
import { alert } from 'stepin';
export const useAuthStore = defineStore('auth', {
  state() {
    return {
      authorities: [],
    };
  },
  actions: {
    setAuthorities(authorities) {
      this.authorities = authorities;
    },
    hasAuthority(authority) {
      return this.authorities.indexOf(authority) !== -1;
    },
    /**
     * 给函数添加 权限校验
     * @param key
     * @param func
     * @returns
     */
    useAuth(key, func) {
      const _this = this;
      return function t() {
        if (!_this.hasAuthority(key)) {
          alert.error(msgFormatter(key));
        } else {
          return func.apply(undefined, arguments);
        }
      };
    },
  },
});
/**
 * 给函数添加 权限校验
 * @param key
 * @param func
 * @returns
 */
export function useAuth(key, func) {
  return function t() {
    const authStore = useAuthStore();
    if (!authStore.hasAuthority(key)) {
      alert.error(msgFormatter(key));
    } else {
      return func.apply(undefined, arguments);
    }
  };
}
function msgFormatter(access) {
  return `对不起，您没有 \`${access}\` 权限`;
}
const operators = {
  hide: {
    reject: (el, access, config) => {
      el.setAttribute('_display', el.style.display);
      el.style.display = 'none';
    },
    access: (el, access, config) => {
      if (el.hasAttribute('_display')) {
        el.style.display = el.getAttribute('_display');
      }
      el.removeAttribute('_display');
    },
  },
  disable: {
    reject: (el, access, config) => {
      el.classList.add(config.disableClass);
      el.setAttribute('disabled', '');
      el.setAttribute('title', config.formatter(access));
    },
    access: (el, access, config) => {
      el.classList.remove(config.disableClass);
    },
  },
};
const AuthPlugin = {
  install(
    app,
    {
      disableClass = 'auth-disable',
      action = 'disable',
      formatter = msgFormatter,
    } = {}
  ) {
    app.directive('auth', (el, { value, arg: access, modifiers }, vnode) => {
      const { disable, hide } = modifiers;
      const _action = hide ? 'hide' : disable ? 'disable' : undefined;
      const authConfig = { disableClass, formatter, action: _action ?? action };
      const operator = operators[authConfig.action];
      const authorStore = useAuthStore();
      if (!authorStore.hasAuthority(access)) {
        operator.reject(el, access, authConfig);
      } else {
        operator.access(el, access, authConfig);
      }
    });
  },
};
export default AuthPlugin;
