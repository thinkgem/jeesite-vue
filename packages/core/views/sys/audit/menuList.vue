<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
-->
<template>
  <PageWrapper :sidebarWidthRight="500" :dense="true">
    <template #sidebarRight>
      <ScrollContainer>
        <BasicTable @register="registerRoleTable" @row-click="handleRoleSelect" class="mb-3">
          <template #tableTitle>
            <span class="ml-1">{{ t('拥有角色') }}</span>
            <Tooltip placement="top">
              <template #title>
                <div>{{ t('当前用户拥有的角色列表，除了用户和角色直接关联外，还有可能有以下关联：') }}</div>
                <div>
                  {{ t('1、如果启用部门角色，user.officeRolePermi: 将获取 用户->部门->关联角色') }}
                </div>
                <div>
                  {{ t('2、如果启用岗位角色，user.postRolePermi: 将获取 用户->岗位->关联角色') }}
                </div>
                <div>
                  {{ t('3、如果启用切换部门功能，user.switchOffice: 将获取 用户->附属部门->岗位->关联角色') }}
                </div>
              </template>
              <Icon icon="i-ant-design:question-circle-outlined" class="pl-1 cursor-pointer" />
            </Tooltip>
          </template>
          <template #toolbar>
            <a-button class="btn-refresh" @click="handleRefresh" size="small">
              {{ t('刷新') }}
            </a-button>
          </template>
        </BasicTable>
        <template v-for="item in sysCodeRef" :key="item.id">
          <div class="mb-3">
            <BasicTree
              :title="item.name"
              :toolbar="true"
              :showIcon="true"
              :immediate="false"
              :defaultExpandLevel="1"
              :ref="setTreeRefs(item.value)"
            />
          </div>
        </template>
      </ScrollContainer>
    </template>
    <BasicTable @register="registerTable" @row-click="handleUserSelect">
      <template #tableTitle>
        <AuditTabs activeKey="/sys/audit/menuList" />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
<script lang="ts" setup name="ViewsSysAuditMenuList">
  import { ref, onMounted } from 'vue';
  import { Tooltip } from 'antdv-next';
  import { PageWrapper } from '@jeesite/core/components/Page';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useDict } from '@jeesite/core/components/Dict';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicTree, TreeActionType } from '@jeesite/core/components/Tree';
  import { BasicTable, BasicColumn, useTable } from '@jeesite/core/components/Table';
  import { FormProps } from '@jeesite/core/components/Form';
  import { officeTreeData } from '@jeesite/core/api/sys/office';
  import { auditUserListData, auditRoleListData, auditMenuTreeData } from '@jeesite/core/api/sys/audit';
  import AuditTabs from './components/AuditTabs.vue';
  import ScrollContainer from '@jeesite/core/components/Container/src/ScrollContainer.vue';

  const { t } = useI18n('bpm.button');

  const userCode = ref('');
  const roleCode = ref('');
  const sysCodeRef = ref<Array<Recordable>>([]);
  const treeRefs: Recordable<TreeActionType> = {};

  const setTreeRefs = (key: string) => (el: any) => {
    if (el) {
      treeRefs[key] = el;
    }
  };

  onMounted(async () => {
    sysCodeRef.value = await useDict().initGetDictList('sys_menu_sys_code');
    loadMenuTreeData();
  });

  const searchForm: FormProps = {
    baseColProps: { md: 8, lg: 8 },
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

  const [registerTable, { reload }] = useTable({
    api: auditUserListData,
    beforeFetch: (params) => {
      params.isAll = 'true';
      return params;
    },
    columns: tableColumns,
    formConfig: searchForm,
    showTableSetting: true,
    useSearchForm: true,
    canResize: true,
    rowSelection: {
      type: 'radio',
      columnWidth: 0,
    },
  });

  const roleColumns: BasicColumn[] = [
    { title: t('角色名称'), dataIndex: 'roleName', width: 100, align: 'center' },
    { title: t('角色编码'), dataIndex: 'roleCode', width: 100, align: 'center' },
  ];

  const [registerRoleTable, { reload: reloadRole, clearSelectedRowKeys }] = useTable({
    api: auditRoleListData,
    beforeFetch: (params) => {
      params.userCode = userCode.value;
      return params;
    },
    columns: roleColumns,
    showTableSetting: false,
    useSearchForm: false,
    canResize: false,
    pagination: false,
    bordered: true,
    size: 'small',
    rowKey: 'roleCode',
    rowSelection: {
      type: 'radio',
      columnWidth: 0,
    },
  });

  async function loadMenuTreeData() {
    const res = (await auditMenuTreeData({ userCode: userCode.value, roleCode: roleCode.value })) as Recordable;
    const menuMap = res?.menuMap || {};
    sysCodeRef.value.forEach((item) => {
      const code = item.value;
      if (treeRefs[code]) {
        treeRefs[code].setTreeData(menuMap[code] || []);
      }
    });
  }

  function handleUserSelect(record: Recordable) {
    userCode.value = record.id || '';
    roleCode.value = '';
    reloadRole();
    loadMenuTreeData();
  }

  function handleRefresh() {
    roleCode.value = '';
    clearSelectedRowKeys();
    loadMenuTreeData();
  }

  function handleRoleSelect(record: Recordable) {
    roleCode.value = record.roleCode || '';
    loadMenuTreeData();
  }
</script>
