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
        <a-button type="primary" @click="handleForm({})" v-auth="'app:appComment:edit'">
          <Icon icon="i-ant-design:plus-outlined" class="pr-1" />
          {{ t('新增') }}
        </a-button>
      </template>
      <template #firstColumn="{ record }">
        <a @click="handleForm(record)">{{ record.content || record.id }}</a>
      </template>
    </BasicTable>
    <InputForm @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup name="ViewsAppAppCommentList">
  import { unref } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { router } from '@jeesite/core/router';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicTable, BasicColumn, useTable } from '@jeesite/core/components/Table';
  import { useDrawer } from '@jeesite/core/components/Drawer';
  import { FormProps } from '@jeesite/core/components/Form';
  import {
    appCommentListData,
    appCommentDelete,
    appCommentDisable,
    appCommentEnable,
  } from '../../../api/app/appComment';
  import InputForm from './form.vue';

  const { t } = useI18n('bpm.button');
  const { showMessage } = useMessage();
  const { meta } = unref(router.currentRoute);
  const getTitle = { icon: meta.icon || 'i-ant-design:book-outlined', value: meta.title || t('意见管理') };

  const searchForm: FormProps = {
    baseColProps: { md: 8, lg: 6 },
    labelWidth: 90,
    schemas: [
      {
        label: t('问题分类'),
        field: 'category',
        component: 'Select',
        componentProps: { dictType: 'app_comment_category', allowClear: true },
      },
      { label: t('问题和意见'), field: 'content', component: 'Input' },
      { label: t('联系方式'), field: 'contact', component: 'Input' },
      {
        label: t('状态'),
        field: 'status',
        component: 'Select',
        componentProps: { dictType: 'app_comment_status', allowClear: true, onChange: handleSuccess },
      },
      {
        label: t('回复人员'),
        field: 'replyUserCode',
        // fieldLabel: 'replyUserName',
        component: 'ListSelect',
        componentProps: { selectType: 'empUserSelect', allowClear: true },
      },
    ],
  };

  const tableColumns: BasicColumn[] = [
    { title: t('问题和意见'), dataIndex: 'content', width: 250, align: 'left', slot: 'firstColumn' },
    { title: t('问题分类'), dataIndex: 'category', width: 100, align: 'center', dictType: 'app_comment_category' },
    { title: t('联系方式'), dataIndex: 'contact', width: 150, align: 'center' },
    { title: t('状态'), dataIndex: 'status', width: 100, align: 'center', dictType: 'app_comment_status' },
    { title: t('提问时间'), dataIndex: 'createDate', width: 150, align: 'center' },
    { title: t('提问人员'), dataIndex: 'createByName', width: 150, align: 'center' },
    { title: t('回复时间'), dataIndex: 'replyDate', width: 150, align: 'center' },
    { title: t('回复意见'), dataIndex: 'replyContent', width: 150, align: 'left' },
    { title: t('回复人员'), dataIndex: 'replyUserName', width: 150, align: 'center' },
  ];

  const actionColumn: BasicColumn = {
    width: 120,
    actions: (record: Recordable) => [
      {
        icon: 'i-clarity:note-edit-line',
        title: t('编辑'),
        onClick: handleForm.bind(this, record),
        auth: 'app:appComment:edit',
      },
      {
        icon: 'i-ant-design:stop-outlined',
        color: 'error',
        title: t('停用'),
        popConfirm: { title: t('确认要停用该意见吗？'), confirm: handleDisable.bind(this, record) },
        auth: 'app:appComment:edit',
        ifShow: () => record.status === '0',
      },
      {
        icon: 'i-ant-design:check-outlined',
        color: 'success',
        title: t('启用'),
        popConfirm: { title: t('确认要启用该意见吗？'), confirm: handleEnable.bind(this, record) },
        auth: 'app:appComment:edit',
        ifShow: () => record.status === '1',
      },
      {
        icon: 'i-ant-design:delete-outlined',
        color: 'error',
        title: t('删除'),
        popConfirm: { title: t('确认要删除该意见吗？'), confirm: handleDelete.bind(this, record) },
        auth: 'app:appComment:edit',
      },
    ],
  };

  const [registerTable, { reload }] = useTable({
    api: appCommentListData,
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
    await appCommentDisable({ id: r.id });
    handleSuccess();
  }
  async function handleEnable(r: Recordable) {
    await appCommentEnable({ id: r.id });
    handleSuccess();
  }
  async function handleDelete(r: Recordable) {
    await appCommentDelete({ id: r.id });
    handleSuccess();
  }
  function handleSuccess() {
    reload();
  }
</script>
