import { defineStore } from 'pinia';
import http from './http';
import { useMenuStore } from './menu';
import { useAuthStore } from '@/plugins';
export const useAccountStore = defineStore('account', {
  state() {
    return {
      account: {},
      permissions: [],
      role: '',
      logged: true,
    };
  },
  actions: {
    async login(username, password) {
      return http
        .request('/login', 'post_json', { username, password })
        .then(async (response) => {
          if (response.code === 0) {
            this.logged = true;
            http.setAuthorization(
              `Bearer ${response.data.token}`,
              new Date(response.data.expires)
            );
            await useMenuStore().getMenuList();
            return response.data;
          } else {
            return Promise.reject(response);
          }
        });
    },
    async logout() {
      return new Promise((resolve) => {
        http.removeAuthorization();
        this.logged = false;
        resolve(true);
      });
    },
    async profile() {
      return http.request('/account', 'get').then((response) => {
        if (response.code === 0) {
          const { setAuthorities } = useAuthStore();
          const { account, permissions, role } = response.data;
          this.account = account;
          this.permissions = permissions;
          this.role = role;
          setAuthorities(permissions);
          return response.data;
        } else {
          return Promise.reject(response);
        }
      });
    },
    setLogged(logged) {
      this.logged = logged;
    },
  },
});
