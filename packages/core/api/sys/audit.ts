/**
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';

const { adminPath } = useGlobSetting();

export const auditListData = (params?: any) => defHttp.post({ url: adminPath + '/sys/audit/listData', params });

export const auditUserListData = (params?: any) => defHttp.post({ url: adminPath + '/sys/audit/userListData', params });

export const auditRoleListData = (params?: any) => defHttp.post({ url: adminPath + '/sys/audit/roleListData', params });

export const auditMenuTreeData = (params?: any) => defHttp.post({ url: adminPath + '/sys/audit/menuTreeData', params });

export const auditExportData = (params?: any) =>
  defHttp.post({ url: adminPath + '/sys/audit/exportData', params, responseType: 'blob' });
