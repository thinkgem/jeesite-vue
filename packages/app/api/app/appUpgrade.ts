/**
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 */
import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';
const { adminPath } = useGlobSetting();

export const appUpgradeListData = (params?: any) =>
  defHttp.post({ url: adminPath + '/app/appUpgrade/listData', params });

export const appUpgradeForm = (params?: any) => defHttp.get({ url: adminPath + '/app/appUpgrade/form', params });

export const appUpgradeSave = (params?: any, data?: any) =>
  defHttp.postJson({ url: adminPath + '/app/appUpgrade/save', params, data });

export const appUpgradeDelete = (params?: any) => defHttp.get({ url: adminPath + '/app/appUpgrade/delete', params });

export const appUpgradeDisable = (params?: any) => defHttp.get({ url: adminPath + '/app/appUpgrade/disable', params });

export const appUpgradeEnable = (params?: any) => defHttp.get({ url: adminPath + '/app/appUpgrade/enable', params });
