import type { AppRouteRecordRaw } from '@jeesite/core/router/types';
import { t } from '@jeesite/core/hooks/web/useI18n';
import { PageEnum } from '@jeesite/core/enums/pageEnum';

export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_LOGIN,
  meta: {
    title: 'Root',
  },
};

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@jeesite/core/layouts/views/login/Login.vue'),
  meta: {
    title: t('routes.basic.login'),
  },
};

export const ModPwdRoute: AppRouteRecordRaw = {
  path: '/modPwd',
  name: 'ModPwd',
  component: () => import('@jeesite/core/layouts/views/account/modPwd.vue'),
  meta: {
    icon: 'i-ant-design:key-outlined',
    title: t('sys.account.modifyPwd'),
  },
};

export default [RootRoute, LoginRoute, ModPwdRoute];
