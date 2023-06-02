import { defineStore, storeToRefs } from 'pinia';
import http from './http';
import { ref, watch } from 'vue';
import { addRoutes, removeRoute } from '@/router/dynamicRoutes';
import { useSettingStore } from './setting';
import { useAuthStore } from '@/plugins';
import router from '@/router';
/**
 * 过滤菜单
 * @param routes
 * @param parentPermission
 */
function doMenuFilter(routes, parentPermission) {
  const { hasAuthority } = useAuthStore();
  const setCache = (meta) => {
    meta._cache = {
      renderMenu: meta.renderMenu,
    };
  };
  routes.forEach((route) => {
    const required = route.meta?.permission ?? parentPermission;
    // if (route.meta?.renderMenu === undefined && required) {
    if (required) {
      route.meta = route.meta ?? {};
      setCache(route.meta);
      route.meta.renderMenu = hasAuthority(route.meta.permission);
    }
    if (route.children) {
      doMenuFilter(route.children, required);
    }
  });
}
/**
 * 重置过滤
 * @param routes
 */
function resetMenuFilter(routes) {
  const resetCache = (meta) => {
    if (meta._cache) {
      meta.renderMenu = meta._cache?.renderMenu;
    }
    delete meta._cache;
  };
  routes.forEach((route) => {
    if (route.meta) {
      resetCache(route.meta);
    }
    if (route.children) {
      resetMenuFilter(route.children);
    }
  });
}
// 菜单数据转为路由数据
const toRoutes = (list) => {
  return list.map((item) => ({
    name: item.name,
    path: item.path,
    component: item.component,
    children: item.children && toRoutes(item.children),
    meta: {
      title: item.title,
      permission: item.permission,
      icon: item.icon,
      renderMenu: item.renderMenu,
      cacheable: item.cacheable,
      href: item.link,
      badge: /^(false|true)$/i.test(item.badge + '')
        ? JSON.parse(item.badge + '')
        : item.badge,
      target: item.target,
      view: item.view,
    },
  }));
};
export const useMenuStore = defineStore('menu', () => {
  const menuList = ref([]);
  const loading = ref(false);
  const { filterMenu } = storeToRefs(useSettingStore());
  const checkMenuPermission = () => {
    console.log('------');
    if (filterMenu.value) {
      doMenuFilter(router.options.routes);
      console.log(router.options.routes);
    } else {
      resetMenuFilter(router.options.routes);
    }
  };
  checkMenuPermission();
  watch(filterMenu, checkMenuPermission);
  async function getMenuList() {
    loading.value = true;
    return http
      .request('/menu', 'GET')
      .then((res) => {
        const { data } = res;
        menuList.value = data;
        addRoutes(toRoutes(data));
        checkMenuPermission();
        return data;
      })
      .finally(() => (loading.value = false));
  }
  async function addMenu(menu) {
    return http
      .request('/menu', 'POST_JSON', menu)
      .then((res) => {
        return res.data;
      })
      .finally(getMenuList);
  }
  async function updateMenu(menu) {
    return http
      .request('/menu', 'PUT_JSON', menu)
      .then((res) => {
        return res.data;
      })
      .finally(getMenuList);
  }
  async function removeMenu(id) {
    return http
      .request('/menu', 'DELETE', { id })
      .then(async (res) => {
        if (res.code === 0) {
          removeRoute(res.data.name);
        }
      })
      .finally(getMenuList);
  }
  return {
    loading,
    menuList,
    getMenuList,
    addMenu,
    updateMenu,
    removeMenu,
  };
});
