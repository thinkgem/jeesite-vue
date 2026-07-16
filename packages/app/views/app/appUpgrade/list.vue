<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
-->
<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <Icon :icon="getTitle.icon" class="m-1 pr-1" />
        <span> {{ getTitle.value }} </span>
      </template>
      <template #toolbar>
        <a-button type="primary" @click="handleForm({})" v-auth="'app:appUpgrade:edit'">
          <Icon icon="i-ant-design:plus-outlined" class="pr-1" /> {{ t('新增') }}
        </a-button>
      </template>
      <template #firstColumn="{ record }">
        <a @click="handleForm(record)">{{ record.upTitle || record.id }}</a>
      </template>
    </BasicTable>
    <InputForm @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup name="ViewsAppAppUpgradeList">
  import { unref } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { router } from '@jeesite/core/router';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicTable, BasicColumn, useTable } from '@jeesite/core/components/Table';
  import { useDrawer } from '@jeesite/core/components/Drawer';
  import { FormProps } from '@jeesite/core/components/Form';
  import {
    appUpgradeListData,
    appUpgradeDelete,
    appUpgradeDisable,
    appUpgradeEnable,
  } from '../../../api/app/appUpgrade';
  import InputForm from './form.vue';

  const { t } = useI18n('bpm.button');
  const { showMessage } = useMessage();
  const { meta } = unref(router.currentRoute);
  const getTitle = { icon: meta.icon || 'i-ant-design:book-outlined', value: meta.title || t('版本管理') };

  const searchForm: FormProps = {
    baseColProps: { md: 8, lg: 6 },
    labelWidth: 90,
    schemas: [
      { label: t('升级标题'), field: 'upTitle', component: 'Input' },
      {
        label: t('应用代号'),
        field: 'appCode',
        component: 'Select',
        componentProps: { dictType: 'app_code', allowClear: true },
      },
      {
        label: t('升级类型'),
        field: 'upType',
        component: 'Select',
        componentProps: { dictType: 'app_upgrade_type', allowClear: true },
      },
      { label: t('发布时间'), field: 'upDate', component: 'DatePicker' },
      {
        label: t('状态'),
        field: 'status',
        component: 'Select',
        componentProps: { dictType: 'sys_search_status', allowClear: true, onChange: handleSuccess },
      },
    ],
  };

  const tableColumns: BasicColumn[] = [
    { title: t('升级标题'), dataIndex: 'upTitle', width: 200, align: 'left', slot: 'firstColumn' },
    { title: t('应用代号'), dataIndex: 'appCode', width: 130, align: 'center', dictType: 'app_code' },
    { title: t('版本号码'), dataIndex: 'upVersion', width: 90, align: 'center' },
    { title: t('升级类型'), dataIndex: 'upType', width: 100, align: 'center', dictType: 'app_upgrade_type' },
    { title: t('发布时间'), dataIndex: 'upDate', width: 100, align: 'center' },
    { title: t('升级内容'), dataIndex: 'upContent', width: 250, align: 'left' },
    { title: t('状态'), dataIndex: 'status', width: 80, align: 'center', dictType: 'sys_search_status' },
    { title: t('更新时间'), dataIndex: 'updateDate', width: 150, align: 'center' },
  ];

  const actionColumn: BasicColumn = {
    width: 120,
    actions: (record: Recordable) => [
      {
        icon: 'i-clarity:note-edit-line',
        title: t('编辑'),
        onClick: handleForm.bind(this, record),
        auth: 'app:appUpgrade:edit',
      },
      {
        icon: 'i-ant-design:stop-outlined',
        color: 'error',
        title: t('停用'),
        popConfirm: { title: t('确认要停用该版本吗？'), confirm: handleDisable.bind(this, record) },
        auth: 'app:appUpgrade:edit',
        ifShow: () => record.status === '0',
      },
      {
        icon: 'i-ant-design:check-circle-outlined',
        color: 'success',
        title: t('启用'),
        popConfirm: { title: t('确认要启用该版本吗？'), confirm: handleEnable.bind(this, record) },
        auth: 'app:appUpgrade:edit',
        ifShow: () => record.status === '2',
      },
      {
        icon: 'i-ant-design:delete-outlined',
        color: 'error',
        title: t('删除'),
        popConfirm: { title: t('确认要删除该版本吗？'), confirm: handleDelete.bind(this, record) },
        auth: 'app:appUpgrade:edit',
      },
    ],
  };

  const [registerTable, { reload }] = useTable({
    api: appUpgradeListData,
    columns: tableColumns,
    actionColumn,
    formConfig: searchForm,
    showTableSetting: true,
    useSearchForm: true,
    canResize: true,
  });

  const [registerDrawer, { openDrawer }] = useDrawer();
  function handleForm(r: Recordable) {
    openDrawer(true, r);
  }
  async function handleDisable(r: Recordable) {
    await appUpgradeDisable({ id: r.id });
    handleSuccess();
  }
  async function handleEnable(r: Recordable) {
    await appUpgradeEnable({ id: r.id });
    handleSuccess();
  }
  async function handleDelete(r: Recordable) {
    await appUpgradeDelete({ id: r.id });
    handleSuccess();
  }
  function handleSuccess() {
    reload();
  }
</script>
