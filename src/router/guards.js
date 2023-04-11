import http from '@/store/http';
import { useAccountStore, useMenuStore } from '@/store';
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
  before: [ProgressGuard.before, loginGuard, NotFoundGuard.before],
  after: [ProgressGuard.after],
};
