<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
-->
<template>
  <PageWrapper :sidebarWidth="400" :dense="true">
    <template #sidebar>
      <BasicTree
        :search="false"
        :toolbar="true"
        :showIcon="true"
        :api="menuTreeData"
        :params="apiParams"
        :defaultExpandLevel="1"
        @select="handleTreeSelect"
      >
        <template #headerTitle>
          <Dropdown :trigger="['hover']" :dropMenuList="dropMenuList">
            <Icon icon="i-ant-design:menu-outlined" class="pr-1 pl-2" />
            <span class="cursor-pointer">{{ sysName }} <DownOutlined /></span>
          </Dropdown>
        </template>
      </BasicTree>
    </template>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <AuditTabs activeKey="/sys/audit/userList" />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
<script lang="ts" setup name="ViewsSysAuditUserList">
  import { ref, onMounted } from 'vue';
  import { DownOutlined } from '@antdv-next/icons';
  import { Icon } from '@jeesite/core/components/Icon';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useDict } from '@jeesite/core/components/Dict';
  import { Dropdown, DropMenu } from '@jeesite/core/components/Dropdown';
  import { PageWrapper } from '@jeesite/core/components/Page';
  import { BasicTree } from '@jeesite/core/components/Tree';
  import { BasicTable, BasicColumn, useTable } from '@jeesite/core/components/Table';
  import { FormProps } from '@jeesite/core/components/Form';
  import { officeTreeData } from '@jeesite/core/api/sys/office';
  import { menuTreeData } from '@jeesite/core/api/sys/menu';
  import { auditUserListData } from '@jeesite/core/api/sys/audit';
  import AuditTabs from './components/AuditTabs.vue';

  const { t } = useI18n('bpm.button');

  const dropMenuList = ref<Array<DropMenu>>([]);
  const sysCode = ref('default');
  const sysName = ref(t('全部菜单'));
  const apiParams = ref<Recordable>({ sysCode: 'default' });
  const menuCode = ref('');

  onMounted(async () => {
    dropMenuList.value = (await useDict().initGetDictList('sys_menu_sys_code')).map((item) => {
      if (item.value == sysCode.value) {
        sysName.value = item.name;
      }
      return {
        text: item.name,
        event: item.value,
        icon: 'i-radix-icons:dot',
        onClick: () => {
          sysCode.value = item.value;
          sysName.value = item.name;
          apiParams.value.sysCode = item.value;
          menuCode.value = '';
          reload();
        },
      };
    });
  });

  const searchForm: FormProps = {
    baseColProps: { md: 8, lg: 6 },
    labelWidth: 90,
    schemas: [
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
    { title: t('创建时间'), dataIndex: 'createDate', width: 100, align: 'center' },
    { title: t('更新时间'), dataIndex: 'updateDate', width: 100, align: 'center' },
    { title: t('状态'), dataIndex: 'status', width: 70, align: 'center', dictType: 'sys_status' },
    { title: t('类型'), dataIndex: 'userType', width: 50, align: 'center', dictType: 'sys_user_type' },
  ];

  const [registerTable, { reload, getForm }] = useTable({
    api: auditUserListData,
    beforeFetch: (params) => {
      params.menuCode = menuCode.value;
      return params;
    },
    columns: tableColumns,
    formConfig: searchForm,
    showTableSetting: true,
    useSearchForm: true,
    canResize: true,
  });

  function handleTreeSelect(selectedKeys: string[]) {
    menuCode.value = selectedKeys[0] || '';
    getForm().setFieldsValue({ menuCode: menuCode.value });
    reload();
  }
</script>
