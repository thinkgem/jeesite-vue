<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <BasicDrawer v-bind="$attrs" :showFooter="true" @register="registerDrawer" @ok="handleSubmit" width="60%">
    <template #title>
      <Icon :icon="getTitle.icon" class="m-1 pr-1" />
      <span> {{ getTitle.value }} </span>
    </template>
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" setup name="ViewsSysLangForm">
  import { ref, unref, computed } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { router } from '@jeesite/core/router';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicForm, FormSchema, useForm } from '@jeesite/core/components/Form';
  import { BasicDrawer, useDrawerInner } from '@jeesite/core/components/Drawer';
  import { langForm, langSave } from '@jeesite/core/api/sys/lang';

  const emit = defineEmits(['success', 'register']);
  const { t } = useI18n('bpm.button');
  const { showMessage } = useMessage();
  const { meta } = unref(router.currentRoute);
  const record = ref<Recordable>({});
  const moduleOptions = ref<any[]>([]);

  const getTitle = computed(() => ({
    icon: meta.icon || 'i-ant-design:book-outlined',
    value: record.value.isNewRecord ? t('新增语言') : t('编辑语言'),
  }));

  const inputFormSchemas: FormSchema[] = [
    {
      label: t('基本信息'),
      field: 'divider-basic',
      component: 'FormGroup',
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('语言编码'),
      field: 'langCode',
      component: 'Input',
      componentProps: { maxlength: 500 },
      required: true,
    },
    {
      label: t('语言译文'),
      field: 'langText',
      component: 'Input',
      componentProps: { maxlength: 500 },
      required: true,
    },
    {
      label: t('语言类型'),
      field: 'langType',
      component: 'RadioGroup',
      componentProps: { dictType: 'sys_lang_type' },
      required: true,
    },
    {
      label: t('归属模块'),
      field: 'module.moduleCode',
      component: 'Select',
      componentProps: {
        options: moduleOptions,
        fieldNames: { label: 'moduleNameText', value: 'moduleCode' },
        allowClear: true,
      },
      required: true,
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('其它信息'),
      field: 'divider-other',
      component: 'FormGroup',
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('备注信息'),
      field: 'remarks',
      component: 'InputTextArea',
      componentProps: { maxlength: 500, rows: 3 },
      colProps: { md: 24, lg: 24 },
    },
  ];

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 120,
    schemas: inputFormSchemas,
    baseColProps: { md: 24, lg: 24 },
  });

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ loading: true });
    await resetFields();
    const res = await langForm({ id: data?.id });
    record.value = (res as Recordable)?.lang || {};
    record.value.__t = new Date().getTime();
    moduleOptions.value = (res as Recordable)?.moduleList || [];
    await setFieldsValue(record.value);
    setDrawerProps({ loading: false });
  });

  async function handleSubmit() {
    try {
      const data = await validate();
      setDrawerProps({ confirmLoading: true });
      const params: any = {
        isNewRecord: record.value.isNewRecord,
        id: record.value.id,
        oldLangCode: record.value.langCode,
        oldLangType: record.value.langType,
      };
      const res = await langSave(params, data);
      showMessage(res.message);
      setTimeout(closeDrawer);
      emit('success', data);
    } catch (error: any) {
      if (error && error.errorFields) showMessage(error.message || t('common.validateError'));
      console.log('error', error);
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
