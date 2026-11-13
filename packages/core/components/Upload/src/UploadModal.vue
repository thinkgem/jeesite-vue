<template>
  <BasicModal
    width="80%"
    :title="getTitle"
    :okText="t('component.upload.save')"
    :cancelText="readonly ? t('component.modal.close') : undefined"
    v-bind="$attrs"
    @register="register"
    @ok="handleOk"
    :closeFunc="handleCloseFunc"
    :maskClosable="false"
    :keyboard="false"
    wrapClassName="upload-modal"
    :showOkBtn="!readonly"
    :okButtonProps="getOkButtonProps"
    :cancelButtonProps="{ disabled: uploading }"
  >
    <template #centerFooter>
      <a-button
        v-if="!readonly"
        @click="handleStartUpload"
        color="success"
        :disabled="!getIsSelectFile"
        :loading="uploading"
        v-show="isLazy"
      >
        {{ getUploadBtnText }}
      </a-button>
    </template>

    <div ref="pasteRef" class="upload-modal-body" tabindex="-1" @paste="handlePaste">
      <div class="upload-modal-toolbar" v-if="!readonly">
        <Alert :title="getAlertTitle" type="info" banner class="upload-modal-toolbar__text" />
        <Upload
          :accept="getStringAccept"
          :multiple="multiple"
          :before-upload="beforeUpload"
          :directory="directory"
          :show-upload-list="false"
          class="upload-modal-toolbar__btn"
        >
          <a-button type="primary">
            {{ t('component.upload.choose') }}
          </a-button>
        </Upload>
      </div>
      <div class="pb-2" :class="listType === 'grid' ? 'overflow-y-auto' : 'overflow-x-auto'">
        <FileList
          :dataSource="fileItemList"
          :columns="columns"
          :actionColumn="actionColumn"
          :listType="listType"
          :dragSort="props.dragSort && !props.readonly"
          :emptyText="getEmptyText"
          :dropUpload="!props.readonly && !props.disabled"
          @reorder="handleReorder"
          @dropFiles="handleDropFiles"
        />
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  /**
   * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
   * No deletion without permission, or be held responsible to law.
   * @author ThinkGem
   */
  import { computed, nextTick, ref } from 'vue';
  import { Upload, Alert } from 'antdv-next';
  import { BasicModal, useModalInner } from '@jeesite/core/components/Modal';
  import { uploadPreviewProps } from './props';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useFileItemList } from './useFileItemList';
  import { getClipboardImageFiles, isEditableElement, onDocumentPaste } from './usePasteUpload';
  import FileList from './FileList.vue';

  const props = defineProps(uploadPreviewProps);
  const emit = defineEmits(['change', 'register', 'delete']);

  const { t } = useI18n();

  const {
    fileItemList,
    uploading,
    getIsSelectFile,
    getOkButtonProps,
    getUploadBtnText,
    getStringAccept,
    getAlertTitle,
    columns,
    listType,
    actionColumn,
    getEmptyText,
    initFileItemList,
    beforeUpload,
    handleReorder,
    handleStartUpload,
    handleCloseFunc,
    handleOk: submitFileList,
  } = useFileItemList(props, emit);

  const pasteRef = ref<HTMLElement>();

  const [register, { closeModal, getOpen }] = useModalInner(() => {
    initFileItemList();
    // 打开弹窗后聚焦内容区，支持直接 Ctrl+V 粘贴上传图片
    nextTick(() => pasteRef.value?.focus());
  });

  // 弹窗内的粘贴上传：弹窗打开后浏览器会把焦点给到弹窗容器（.ant-modal-wrap），
  // 内容区自身的 @paste 收不到事件，故在 document 上兜底；关闭后自动失效
  onDocumentPaste(
    (event) => {
      if (!getOpen?.value || props.readonly || props.disabled) {
        return false;
      }
      const body = pasteRef.value;
      if (body && event.target instanceof Node && body.contains(event.target)) {
        return false;
      }
      // 焦点在可编辑控件上时，粘贴由该控件自行处理，不抢占
      return !isEditableElement(document.activeElement);
    },
    (event) => handlePaste(event),
  );

  // 只读（或禁用）时，只显示已上传的文件，不能上传
  const getTitle = computed(() => (props.readonly ? t('component.upload.view') : t('component.upload.upload')));

  // 点击保存：先关闭弹窗再触发 change，避免关闭动画过程中内容塌陷闪烁
  function handleOk() {
    const fileList = submitFileList();
    if (fileList) {
      closeModal();
      emit('change', fileList);
    }
  }

  // 从资源管理器拖入文件直接上传（与点击「选择」走同一 beforeUpload 逻辑）
  function handleDropFiles(files: File[]) {
    if (props.readonly) return;
    for (const file of files) {
      beforeUpload(file);
    }
  }

  // 弹窗内 Ctrl+V 粘贴剪贴板图片，直接加入上传列表（与拖入、选择文件同一逻辑）
  function handlePaste(event: ClipboardEvent) {
    if (props.readonly || props.disabled) return;
    const files = getClipboardImageFiles(event);
    if (files.length == 0) return;
    event.preventDefault();
    handleDropFiles(files);
  }
</script>
<style lang="less">
  .upload-modal {
    &-body {
      outline: none;
    }

    .ant-upload-list {
      display: none;
    }

    .ant-table-wrapper .ant-spin-nested-loading {
      padding: 0;
    }

    &-toolbar {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &__btn {
        margin-left: 8px;
        text-align: right;
        flex: 1;
      }
    }
  }
</style>
