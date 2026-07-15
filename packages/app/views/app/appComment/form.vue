<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
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
<script lang="ts" setup name="ViewsAppAppCommentForm">
  import { ref, unref, computed } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { router } from '@jeesite/core/router';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicForm, FormSchema, useForm } from '@jeesite/core/components/Form';
  import { BasicDrawer, useDrawerInner } from '@jeesite/core/components/Drawer';
  import { appCommentForm, appCommentSave } from '../../../api/app/appComment';

  const emit = defineEmits(['success', 'register']);
  const { t } = useI18n('bpm.button');
  const { showMessage } = useMessage();
  const { meta } = unref(router.currentRoute);
  const record = ref<Recordable>({});

  const getTitle = computed(() => ({
    icon: meta.icon || 'i-ant-design:book-outlined',
    value: record.value.isNewRecord ? t('新增意见') : t('编辑意见'),
  }));

  const inputFormSchemas: FormSchema[] = [
    { label: t('基本信息'), field: 'd1', component: 'FormGroup', colProps: { md: 24, lg: 24 } },
    {
      label: t('问题分类'),
      field: 'category',
      component: 'Select',
      componentProps: { dictType: 'app_comment_category' },
      required: true,
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('问题和意见'),
      field: 'content',
      component: 'InputTextArea',
      componentProps: { rows: 4, maxlength: 500 },
      required: true,
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('联系方式'),
      field: 'contact',
      component: 'Input',
      componentProps: { maxlength: 200 },
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('图片上传'),
      field: 'dataMap',
      component: 'Upload',
      componentProps: {
        loadTime: computed(() => record.value.__t),
        bizKey: computed(() => record.value.id),
        bizType: 'appComment_image',
        uploadType: 'image',
      },
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('设备信息'),
      field: 'deviceInfo',
      component: 'InputTextArea',
      componentProps: { rows: 4, maxlength: 500, disabled: true },
      colProps: { md: 24, lg: 24 },
    },
    { label: t('回复信息'), field: 'd2', component: 'FormGroup', colProps: { md: 24, lg: 24 } },
    {
      label: t('回复意见'),
      field: 'replyContent',
      component: 'InputTextArea',
      componentProps: { maxlength: 500, rows: 5 },
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('回复时间'),
      field: 'replyDate',
      component: 'Input',
      componentProps: { disabled: true },
      ifShow: () => !!record.value.replyDate,
    },
    {
      label: t('回复人员'),
      field: 'replyUserName',
      component: 'Input',
      componentProps: { disabled: true },
      ifShow: () => !!record.value.replyDate,
    },
    { label: t('其它信息'), field: 'd3', component: 'FormGroup', colProps: { md: 24, lg: 24 } },
    {
      label: t('备注信息'),
      field: 'remarks',
      component: 'InputTextArea',
      componentProps: { maxlength: 500, rows: 3 },
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('修改状态'),
      field: 'status',
      component: 'RadioGroup',
      componentProps: { dictType: 'app_comment_status' },
      required: true,
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
    const res = (await appCommentForm({ id: data.id })) as Recordable;
    record.value = res?.appComment || res || data;
    record.value.__t = new Date().getTime();
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
      };
      const res = await appCommentSave(params, data);
      showMessage(res.message);
      setTimeout(closeDrawer);
      emit('success', data);
    } catch (e: any) {
      if (e?.errorFields) showMessage(e.message);
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
