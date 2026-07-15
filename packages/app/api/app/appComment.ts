/**
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 */
import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';
const { adminPath } = useGlobSetting();

export const appCommentListData = (params?: any) =>
  defHttp.post({ url: adminPath + '/app/appComment/listData', params });

export const appCommentForm = (params?: any) => defHttp.get({ url: adminPath + '/app/appComment/form', params });

export const appCommentSave = (params?: any, data?: any) =>
  defHttp.postJson({ url: adminPath + '/app/appComment/save', params, data });

export const appCommentDelete = (params?: any) => defHttp.get({ url: adminPath + '/app/appComment/delete', params });

export const appCommentDisable = (params?: any) => defHttp.get({ url: adminPath + '/app/appComment/disable', params });

export const appCommentEnable = (params?: any) => defHttp.get({ url: adminPath + '/app/appComment/enable', params });
