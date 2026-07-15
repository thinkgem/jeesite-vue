<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
-->
<template>
  <PageWrapper :contentFullHeight="false" :dense="true">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <AuditTabs activeKey="/sys/audit/list" />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
<script lang="ts" setup name="ViewsSysAuditList">
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { PageWrapper } from '@jeesite/core/components/Page';
  import { BasicTable, BasicColumn, useTable } from '@jeesite/core/components/Table';
  import { FormProps } from '@jeesite/core/components/Form';
  import { officeTreeData } from '@jeesite/core/api/sys/office';
  import { auditListData } from '@jeesite/core/api/sys/audit';
  import AuditTabs from './components/AuditTabs.vue';

  const { t } = useI18n('bpm.button');

  const searchForm: FormProps = {
    baseColProps: { md: 8, lg: 6 },
    labelWidth: 90,
    showAdvancedButton: true,
    schemas: [
      {
        label: t('类型'),
        field: 'auditType',
        component: 'Select',
        componentProps: {
          options: [
            { label: t('全部问题'), value: '0' },
            { label: t('未修改初始密码'), value: '1' },
            { label: t('使用简单密码'), value: '2' },
            { label: t('定期未修改密码'), value: '3' },
            { label: t('长期未登录'), value: '4' },
            { label: t('未设置密保'), value: '5' },
          ],
          onChange: handleSuccess,
        },
      },
      { label: t('账号'), field: 'loginCode', component: 'Input' },
      { label: t('昵称'), field: 'userName', component: 'Input' },
      {
        label: t('机构'),
        field: 'officeCode',
        fieldLabel: 'officeName',
        component: 'TreeSelect',
        componentProps: { api: officeTreeData, allowClear: true, canSelectParent: true },
      },
    ],
  };

  const tableColumns: BasicColumn[] = [
    { title: t('登录账号'), dataIndex: 'loginCode', width: 80, align: 'center' },
    { title: t('用户昵称'), dataIndex: 'userName', width: 80, align: 'center' },
    { title: t('归属机构'), dataIndex: 'officeName', width: 90, align: 'center' },
    { title: t('审计结果'), dataIndex: 'auditResult', width: 235, align: 'left' },
    { title: t('创建时间'), dataIndex: 'createDate', width: 100, align: 'center' },
    { title: t('密码修改时间'), dataIndex: 'pwdUpdateDate', width: 100, align: 'center' },
    { title: t('最后登录时间'), dataIndex: 'lastLoginDate', width: 100, align: 'center' },
    { title: t('状态'), dataIndex: 'status', width: 60, align: 'center', dictType: 'sys_status' },
    { title: t('类型'), dataIndex: 'userType', width: 50, align: 'center', dictType: 'sys_user_type' },
  ];

  const [registerTable, { reload }] = useTable({
    api: auditListData,
    columns: tableColumns,
    formConfig: searchForm,
    showTableSetting: true,
    useSearchForm: true,
    canResize: true,
  });

  function handleSuccess() {
    reload();
  }
</script>
