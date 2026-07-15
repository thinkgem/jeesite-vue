/**
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';
import { LocaleType } from '@jeesite/types/config';

const { adminPath } = useGlobSetting();

export const switchLang = (locale: LocaleType) => {
  return defHttp.get({ url: '/lang/' + locale });
};

export const switchTimeZone = (timeZone: string) => {
  return defHttp.get({ url: '/timeZone?id=' + encodeURIComponent(timeZone) });
};

export const timeZoneTreeData = () => {
  return defHttp.get({ url: '/timeZone/treeData' });
};

// Lang CRUD
export const langList = (params?: any) => defHttp.get({ url: adminPath + '/sys/lang/list', params });

export const langListData = (params?: any) => defHttp.post({ url: adminPath + '/sys/lang/listData', params });

export const langForm = (params?: any) => defHttp.get({ url: adminPath + '/sys/lang/form', params });

export const langSave = (params?: any, data?: any) =>
  defHttp.postJson({ url: adminPath + '/sys/lang/save', params, data });

export const langDelete = (params?: any) => defHttp.get({ url: adminPath + '/sys/lang/delete', params });

export const langClearCache = (params?: any) => defHttp.get({ url: adminPath + '/sys/lang/clearCache', params });
