import type { AppRouteModule } from '@jeesite/core/router/types';

import { PAGE_NOT_FOUND_ROUTE } from '@jeesite/core/router/routes/basic';

import { mainOutRoutes } from './mainOut';

const basics = import.meta.glob('./basics/**/*.ts', { eager: true });
const modules = import.meta.glob('./modules/**/*.ts', { eager: true });

const routeBasicList: AppRouteModule[] = [];

Object.keys(basics).forEach((key) => {
  const mod = (basics as Recordable)[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeBasicList.push(...modList);
});

const routeModuleList: AppRouteModule[] = [];

Object.keys(modules).forEach((key) => {
  const mod = (modules as Recordable)[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});

export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList];

// Basic routing without permission
export const basicRoutes = [...routeBasicList, ...mainOutRoutes];
