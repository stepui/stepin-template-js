// 引入 src/pages 文件夹下所有组件作为动态组件
import Pages from '@/pages';
import router from './index';
import { initUndefined } from '@/utils/helpers';
// 注册 IframeBox、BlankView 组件
Pages['iframe'] = () => import('stepin/es/iframe-box');
Pages['blankView'] = () => import('@/components/layout/BlankView.vue');
Pages['link'] = () => import('@/components/layout/LinkView.vue');
/**
 * 解析路由组件
 * @param component
 * @returns
 */
const parseComponent = (component) => {
  if (component === null || component === undefined) {
    return component;
  }
  if (typeof component === 'string') {
    return Pages[component];
  } else {
    return Object.entries(component).reduce((p, [key, val]) => {
      p[key] = Pages[val];
      return p;
    }, {});
  }
};
/**
 * 解析路由
 * @param routes
 * @returns
 */
function parseRoutes(routes) {
  return routes.map((route) => {
    // 初始化meta
    route.meta = route.meta ?? {};
    initUndefined(route.meta, {
      cacheable: true,
      renderMenu: true,
      link: route.link,
    });
    // 解析组件 及 子路由
    const _route = {
      ...route,
      children: route.children && parseRoutes(route.children),
      component: route.component && parseComponent(route.component),
      components: route.components && parseComponent(route.components),
    };
    // 删除 undefined 属性
    Object.keys(_route).forEach((key) => {
      if (_route[key] === undefined) {
        delete _route[key];
      }
    });
    return _route;
  });
}
/**
 * 提取嵌套路由所有name
 * @param recordList
 * @returns
 */
const extractRouteNames = (recordList) => {
  const result = [];
  recordList.forEach((record) => {
    if (typeof record.name === 'string') {
      result.push(record.name);
    }
    if (record.children) {
      result.push(...extractRouteNames(record.children));
    }
  });
  return result;
};
/**
 * 合并路由
 * @param target
 * @param source
 */
function mergeRoutes(target, source) {
  /**
   * 转换成 map, 不满足过滤条件的 route 值设置为 undefined
   * @param routes
   * @param filter 过滤器
   * @param parentPath
   * @returns
   */
  const toRoutesMap = (routes, filter, parentPath) => {
    parentPath = parentPath ?? '';
    const _map = new Map();
    routes.forEach((route) => {
      const fullPath = /^\//.test(route.path)
        ? route.path
        : `${parentPath}/${route.path}`;
      if (!filter || filter(route)) {
        _map.set(fullPath, {
          ...route,
          children:
            route.children && toRoutesMap(route.children, filter, fullPath),
        });
      } else {
        _map.set(fullPath, undefined);
      }
    });
    return _map;
  };
  // 合并
  const mergeMap = (target, source) => {
    if (!target || !source) {
      return target ?? source;
    }
    const resultMap = new Map();
    // 保证新路由数据顺序
    for (const key of source.keys()) {
      resultMap.set(key, void 0);
    }
    for (const key of target.keys()) {
      resultMap.set(key, void 0);
    }
    target.forEach((v, k) => {
      resultMap.set(k, v);
    });
    source.forEach((v, k) => {
      const t = resultMap.get(k);
      if (t !== undefined) {
        v.children = mergeMap(t.children, v.children);
      }
      resultMap.set(k, v);
    });
    return resultMap;
  };
  // map 转换成 routes
  const toRoutes = (routesMap) => {
    const _routes = [];
    routesMap.forEach((record, path) => {
      if (record) {
        const _route = { ...record };
        if (record.children) {
          _route.children = toRoutes(record.children);
        } else {
          delete _route.children;
        }
        _routes.push(_route);
      }
    });
    return _routes;
  };
  const names = extractRouteNames(source);
  const targetMap = toRoutesMap(
    target,
    (record) => !names.includes(record.name)
  );
  const sourceMap = toRoutesMap(source);
  const routesMap = mergeMap(targetMap, sourceMap);
  return toRoutes(routesMap);
}
/**
 * 查找符合条件的路由
 * @param routes 路由集合
 * @param filter 过滤器
 * @returns
 */
function findRoute(routes, filter) {
  if (routes.length === 0) {
    return undefined;
  }
  return (
    routes.find(filter) ??
    findRoute(
      routes.flatMap((route) => route.children ?? []),
      filter
    )
  );
}
/**
 * 添加路由
 * @param routes
 */
export function addRoutes(routes) {
  const routesRaw = parseRoutes(routes);
  routesRaw.forEach((routeRaw) => router.addRoute(routeRaw));
  router.options.routes = mergeRoutes(router.options.routes, routesRaw);
}
/**
 * 过滤路由配置
 * @param routes 路由配置数组
 * @param filter 过滤条件
 * @returns
 */
function filterRoutes(routes, filter) {
  return routes.filter((route) => {
    if (route.children && route.children.length > 0) {
      route.children = filterRoutes(route.children, filter);
    }
    return filter(route);
  });
}
/**
 * 移出路由
 * @param routeName
 */
export function removeRoute(routeName) {
  router.removeRoute(routeName);
  router.options.routes = filterRoutes(
    router.options.routes,
    (route) => route.name !== routeName
  );
}
/**
 * 添加路由
 * @param routes
 * @param parentName
 * @returns
 */
export function appendRoutes(routes, parentName) {
  const parent = findRoute(
    router.options.routes,
    (route) => route.name === parentName
  );
  if (!parent) {
    console.error(`name为${parentName}的父级路由不存在，请检查`);
    return false;
  }
  const routesRaw = parseRoutes(routes);
  routesRaw.forEach((routeRaw) => router.addRoute(parentName, routeRaw));
  parent.children = mergeRoutes(
    router.options.routes,
    mergeRoutes(parent.children ?? [], routesRaw)
  );
}
