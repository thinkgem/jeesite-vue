<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <div ref="formWrapRef" class="cms-template-form p-4 h-full flex flex-col">
    <div ref="fileNameWrapRef" class="cms-template-form-filename">
      <BasicForm @register="registerForm" :showActionButtonGroup="false" />
    </div>
    <div ref="editorWrapRef" class="cms-template-form-editor mt-2 flex-1 min-h-0">
      <MonacoEditor v-model:value="fileContent" :language="editorLanguage" class="h-full" />
    </div>
    <div ref="footerRef" class="cms-template-form-footer mt-4 flex justify-end">
      <Popconfirm :title="t('确认要保存当前模板吗？')" @confirm="handleSave">
        <a-button type="primary" :loading="saving" :disabled="!fileName">
          <Icon icon="i-ant-design:save-outlined" /> {{ t('保 存') }}
        </a-button>
      </Popconfirm>
      <Popconfirm :title="t('确认要删除当前模板吗？')" @confirm="handleDelete">
        <a-button color="error" :loading="deleting" :disabled="!fileName">
          <Icon icon="i-ant-design:delete-outlined" /> {{ t('删 除') }}
        </a-button>
      </Popconfirm>
    </div>
  </div>
</template>
<script lang="ts" setup name="ViewsCmsTemplateForm">
  import { ref, watch } from 'vue';
  import { Popconfirm } from 'antdv-next';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { Icon } from '@jeesite/core/components/Icon';
  import { MonacoEditor } from '@jeesite/core/components/CodeEditor';
  import { useWindowSizeFn } from '@jeesite/core/hooks/event/useWindowSizeFn';
  import { BasicForm, FormSchema, useForm } from '@jeesite/core/components/Form';
  import {
    CmsTemplate,
    cmsTemplateDeleteFile,
    cmsTemplateForm,
    cmsTemplateSaveFile,
  } from '@jeesite/cms/api/cms/template';
  import { encryptByBase64 } from '@jeesite/core/utils/cipher';
  import { getRefElement } from '@jeesite/core/utils/domUtils';

  const props = defineProps({
    fileName: String, // 当前选中模板文件（路径/名称）
  });

  const emit = defineEmits(['success']);

  const { t } = useI18n('cms.template');
  const { showMessage } = useMessage();
  const record = ref<CmsTemplate>({} as CmsTemplate);
  const editorLanguage = ref('html'); // 模板为 HTML 文件
  const fileContent = ref('');
  const saving = ref(false);
  const deleting = ref(false);

  const editorWrapRef = ref<HTMLElement | null>(null);
  const formWrapRef = ref<HTMLElement | null>(null);
  const fileNameWrapRef = ref<HTMLElement | null>(null);
  const footerRef = ref<HTMLElement | null>(null);

  function calcEditorHeight() {
    if (!editorWrapRef.value) return;
    const container = getRefElement(editorWrapRef);
    if (!container || !formWrapRef.value || !fileNameWrapRef.value || !footerRef.value) return;
    const wrapHeight = formWrapRef.value.clientHeight;
    const headerHeight = fileNameWrapRef.value.clientHeight;
    const footerHeight = footerRef.value.clientHeight;
    const height = wrapHeight - headerHeight - footerHeight - 30;
    container.style.height = (height > 100 ? height : 100) + 'px';
    return height;
  }

  useWindowSizeFn(calcEditorHeight);

  const inputFormSchemas: FormSchema<CmsTemplate>[] = [
    {
      label: t('文件名'),
      field: 'fileName',
      component: 'Input',
      componentProps: {
        maxlength: 255,
        placeholder: '例如：modules/cms/index.html',
      },
      required: true,
      colProps: { md: 24, lg: 24 },
    },
  ];

  const [registerForm, { setFieldsValue, updateSchema, validate }] = useForm<CmsTemplate>({
    labelWidth: 100,
    schemas: inputFormSchemas,
    baseColProps: { md: 24, lg: 24 },
  });

  watch(
    () => props.fileName,
    async (val) => {
      await updateSchema([{ field: 'fileName', componentProps: { disabled: !!val } }]);
      if (val) {
        await loadTemplate(val);
      } else {
        await setFieldsValue({ fileName: '' });
        fileContent.value = '';
      }
    },
  );

  async function loadTemplate(name: string) {
    const res = await cmsTemplateForm({ name });
    record.value = (res.template || {}) as CmsTemplate;
    fileContent.value = record.value.fileContent || '';
    await setFieldsValue({
      fileName: name,
    });
  }

  async function handleSave() {
    if (!props.fileName) return;
    try {
      const data = await validate();
      saving.value = true;
      const params: any = {
        fileName: data.fileName,
        // 内容 Base64 编码后提交，后端解码保存，兼容 UTF-8 中文
        fileContent: encryptByBase64(fileContent.value),
      };
      const res = await cmsTemplateSaveFile(params);
      showMessage(res.message);
      emit('success', params);
    } catch (error: any) {
      if (error && error.errorFields) {
        showMessage(error.message || t('common.validateError'));
      }
    } finally {
      saving.value = false;
    }
  }

  async function handleDelete() {
    if (!props.fileName) return;
    try {
      deleting.value = true;
      const res = await cmsTemplateDeleteFile({ fileName: props.fileName });
      showMessage(res.message);
      emit('success', { fileName: props.fileName });
    } finally {
      deleting.value = false;
    }
  }
</script>
<style lang="less" scoped>
  .cms-template-form {
    background-color: #fff;
    border-radius: 10px;
  }

  .cms-template-form-footer {
    gap: 12px;
  }

  html[data-theme='dark'] {
    .cms-template-form {
      background-color: #1d1d1d;
    }
  }
</style>
