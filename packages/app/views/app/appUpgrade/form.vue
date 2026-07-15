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
<script lang="ts" setup name="ViewsAppAppUpgradeForm">
  import { ref, unref, computed } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { router } from '@jeesite/core/router';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicForm, FormSchema, useForm } from '@jeesite/core/components/Form';
  import { BasicDrawer, useDrawerInner } from '@jeesite/core/components/Drawer';
  import { appUpgradeForm, appUpgradeSave } from '../../../api/app/appUpgrade';

  const emit = defineEmits(['success', 'register']);
  const { t } = useI18n('bpm.button');
  const { showMessage } = useMessage();
  const { meta } = unref(router.currentRoute);
  const record = ref<Recordable>({});

  const getTitle = computed(() => ({
    icon: meta.icon || 'i-ant-design:book-outlined',
    value: record.value.isNewRecord ? t('新增版本') : t('编辑版本'),
  }));

  const inputFormSchemas: FormSchema[] = [
    { label: t('基本信息'), field: 'd1', component: 'FormGroup', colProps: { md: 24, lg: 24 } },
    { label: t('升级标题'), field: 'upTitle', component: 'Input', componentProps: { maxlength: 200 } },
    { label: t('应用代号'), field: 'appCode', component: 'Select', componentProps: { dictType: 'app_code' } },
    {
      label: t('版本号码'),
      field: 'upVersion',
      component: 'InputNumber',
      helpMessage: t('内部版本号，请填写数字'),
      colProps: { md: 24, lg: 24 },
    },
    { label: t('升级类型'), field: 'upType', component: 'Select', componentProps: { dictType: 'app_upgrade_type' } },
    { label: t('发布时间'), field: 'upDate', component: 'DatePicker', componentProps: { format: 'YYYY-MM-DD' } },
    {
      label: t('升级内容'),
      field: 'upContent',
      component: 'InputTextArea',
      componentProps: { maxlength: 1000, rows: 4 },
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('APK下载地址'),
      field: 'apkUrl',
      component: 'Input',
      componentProps: { maxlength: 500 },
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('资源下载地址'),
      field: 'resUrl',
      component: 'Input',
      componentProps: { maxlength: 500 },
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
    baseColProps: { md: 24, lg: 12 },
  });
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ loading: true });
    await resetFields();
    const res = (await appUpgradeForm({ id: data.id })) as Recordable;
    record.value = res?.appUpgrade || res || data;
    record.value.__t = Date.now();
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
      const res = await appUpgradeSave(params, data);
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
