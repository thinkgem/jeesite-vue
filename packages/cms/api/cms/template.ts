/**
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';
import { BasicModel, TreeDataModel } from '@jeesite/core/api/model/baseModel';

const { adminPath } = useGlobSetting();

export interface CmsTemplate extends BasicModel<CmsTemplate> {
  filePath: string; // 文件路径
  fileName: string; // 文件名称
  fileContent: string; // 文件内容
  isDirectory: boolean; // 是否目录
  fileExtension?: string; // 文件扩展名
}

export interface CmsTemplateTreeData extends TreeDataModel {
  isDirectory: boolean; // 是否目录
}

export const cmsTemplateTreeData = (params?: any) =>
  defHttp.get<CmsTemplateTreeData[]>({ url: adminPath + '/cms/template/treeData', params });

export const cmsTemplateForm = (params?: any) =>
  defHttp.get<CmsTemplate>({ url: adminPath + '/cms/template/form', params });

export const cmsTemplateSaveFile = (params?: any) =>
  defHttp.post({ url: adminPath + '/cms/template/saveFileTemplate', params });

export const cmsTemplateDeleteFile = (params?: any) =>
  defHttp.post({ url: adminPath + '/cms/template/deleteFileTemplate', params });
