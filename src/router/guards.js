import http from '@/store/http';
import { useAccountStore, useMenuStore } from '@/store';
import { useAuthStore } from '@/plugins';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
NProgress.configure({ showSpinner: false });
const loginGuard = function (to, from) {
  const account = useAccountStore();
  if (!http.checkAuthorization() && !/^\/(login|home)?$/.test(to.fullPath)) {
    return '/login';
    // account.setLogged(false);
  }
};
// 进度条
const ProgressGuard = {
  before(to, from) {
    NProgress.start();
  },
  after(to, from) {
    NProgress.done();
  },
};
const AuthGuard = {
  before(to, from) {
    const { hasAuthority } = useAuthStore();
    if (to.meta?.permission && !hasAuthority(to.meta?.permission)) {
      return {
        name: '403',
        query: { permission: to.meta.permission, path: to.fullPath },
      };
    }
  },
};
const ForbiddenGuard = {
  before(to) {
    if (to.name === '403' && (to.query.permission || to.query.path)) {
      to.fullPath = to.fullPath
        .replace(/permission=[^&=]*&?/, '')
        .replace(/&?path=[^&=]*&?/, '')
        .replace(/\?$/, '');
      to.params.permission = to.query.permission;
      to.params.path = to.query.path;
      delete to.query.permission;
      delete to.query.path;
    }
  },
};
// 404 not found
const NotFoundGuard = {
  before(to, from) {
    const { loading } = useMenuStore();
    if (to.meta._is404Page && loading) {
      to.params.loading = true;
    }
  },
};
export default {
  before: [
    ProgressGuard.before,
    loginGuard,
    AuthGuard.before,
    ForbiddenGuard.before,
    NotFoundGuard.before,
  ],
  after: [ProgressGuard.after],
};
