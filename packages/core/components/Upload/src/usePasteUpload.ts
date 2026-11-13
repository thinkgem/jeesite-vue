/**
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import type { FileUpload, UploadApiResult, UploadParams } from '@jeesite/core/api/sys/upload';
import { uploadFile, uploadParams } from '@jeesite/core/api/sys/upload';
import { useEventListener } from '@vueuse/core';
import { buildUUID } from '@jeesite/core/utils/uuid';

// 上传参数缓存，避免每次粘贴都请求
let uploadParamsCache: UploadParams | undefined;

export interface UploadFilesResult {
  /** 上传成功的文件编号 */
  fileUploadIds: string[];
  /** 上传成功的文件对象 */
  fileUploads: FileUpload[];
}

export interface UploadFilesOptions {
  /** 业务主键，如聊天会话编号 */
  bizKey: string;
  /** 业务类型，如 ai-agent-chat */
  bizType: string;
  /** 上传类型，默认 image */
  uploadType?: string;
  /** 最多可上传数量，不传或 Infinity 不限制 */
  maxNumber?: number;
  /** 已上传数量，用于计算剩余可上传数量 */
  fileCount?: number;
  /** 提示信息回调 */
  onMessage?: (message: string) => void;
}

/**
 * 剪贴板图片可能没有文件名，补一个带图片扩展名的文件名，避免上传校验或后缀识别失败
 * @author ThinkGem
 */
function normalizeImageFile(file: File): File {
  if (file.name && file.name.includes('.')) {
    return file;
  }
  const ext = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
  return new File([file], `image-${Date.now()}.${ext}`, {
    type: file.type,
    lastModified: Date.now(),
  });
}

/**
 * 从剪贴板事件中提取图片文件
 * @author ThinkGem
 */
export function getClipboardImageFiles(event: ClipboardEvent): File[] {
  const items = event.clipboardData?.items;
  if (!items) {
    return [];
  }
  const files: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind == 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        files.push(normalizeImageFile(file));
      }
    }
  }
  return files;
}

/**
 * 是否为可编辑元素（输入框、文本域、下拉框、富文本）
 * 这类元素有自己的粘贴行为，粘贴上传不应抢占
 * @author ThinkGem
 */
export function isEditableElement(el?: Element | null): boolean {
  const element = el as HTMLElement | null;
  if (!element?.tagName) {
    return false;
  }
  const tagName = element.tagName.toUpperCase();
  return tagName == 'INPUT' || tagName == 'TEXTAREA' || tagName == 'SELECT' || element.isContentEditable === true;
}

/**
 * 文档级粘贴监听
 * 浏览器只向「当前聚焦元素」派发 paste 事件，焦点落在 body、弹窗容器（.ant-modal-wrap）等
 * 粘贴区域外层元素时，区域自身的 @paste 收不到事件，导致「已聚焦却无法粘贴上传」，
 * 故统一在 document 上再捕获一次，由 shouldHandle 判断本次粘贴是否属于该组件。
 * @author ThinkGem
 */
export function onDocumentPaste(
  shouldHandle: (event: ClipboardEvent) => boolean,
  handler: (event: ClipboardEvent) => void,
) {
  if (typeof document == 'undefined') {
    return;
  }
  return useEventListener(document, 'paste', (event: ClipboardEvent) => {
    if (shouldHandle(event)) {
      handler(event);
    }
  });
}

/**
 * 直接上传文件列表（供 Upload 组件内部及外部粘贴上传调用）
 * @author ThinkGem
 */
export async function uploadFiles(files: File[], options: UploadFilesOptions): Promise<UploadFilesResult> {
  const result: UploadFilesResult = { fileUploadIds: [], fileUploads: [] };
  if (!files?.length || !options?.bizKey) {
    return result;
  }
  if (!uploadParamsCache) {
    uploadParamsCache = await uploadParams();
  }
  let uploadList = files;
  if (options.maxNumber && options.maxNumber > 0 && options.maxNumber != Infinity) {
    const remain = options.maxNumber - (options.fileCount || 0);
    if (remain <= 0) {
      options.onMessage?.(`最多上传 ${options.maxNumber} 个文件`);
      return result;
    }
    uploadList = files.slice(0, remain);
  }
  for (const file of uploadList) {
    try {
      // 剪贴板图片可能没有文件名（name 为空），需补一个带图片扩展名的文件名
      const ext = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
      const name = file.name && file.name.includes('.') ? file.name : `image-${Date.now()}.${ext}`;
      const id = buildUUID();
      const resp: any = await uploadFile(
        {
          bizKey: options.bizKey,
          bizType: options.bizType,
          uploadType: options.uploadType || 'image',
          fileMd5: id, // 专业版支持 MD5 校验（秒传）
          fileName: name,
          file,
        } as any,
        () => {},
      );
      // 兼容接口返回被包一层 data 的情况
      const res: UploadApiResult = resp?.data && typeof resp.data == 'object' ? resp.data : (resp as UploadApiResult);
      if (res?.result === 'false') {
        options.onMessage?.(res.message);
        continue;
      }
      // 兼容接口返回 fileUpload 对象或 fileUploadId 字符串
      const fileUpload = res?.fileUpload;
      const fileUploadId = fileUpload?.id || res?.fileUploadId;
      if (fileUploadId) {
        result.fileUploadIds.push(fileUploadId);
      }
      if (fileUpload) {
        result.fileUploads.push(fileUpload);
      }
    } catch (e: any) {
      options.onMessage?.(e?.message || '上传失败');
    }
  }
  return result;
}
