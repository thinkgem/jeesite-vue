<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <Icon :icon="getTitle.icon" class="m-1 pr-1" />
        <span> {{ getTitle.value }} </span>
      </template>
      <template #toolbar>
        <a-button @click="handleClearCache" v-auth="'sys:lang:edit'">
          <Icon icon="i-ant-design:sync-outlined" class="pr-1" /> {{ t('清理缓存') }}
        </a-button>
        <a-button type="primary" @click="handleForm({})" v-auth="'sys:lang:edit'">
          <Icon icon="i-ant-design:plus-outlined" class="pr-1" /> {{ t('新增') }}
        </a-button>
      </template>
      <template #firstColumn="{ record }">
        <a @click="handleForm(record)">{{ record.langCode || record.id }}</a>
      </template>
    </BasicTable>
    <InputForm @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup name="ViewsSysLangList">
  import { ref, unref, onMounted } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { router } from '@jeesite/core/router';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicTable, BasicColumn, useTable } from '@jeesite/core/components/Table';
  import { useDrawer } from '@jeesite/core/components/Drawer';
  import { FormProps } from '@jeesite/core/components/Form';
  import { langList, langListData, langDelete, langClearCache } from '@jeesite/core/api/sys/lang';
  import InputForm from './form.vue';

  const { t } = useI18n('bpm.button');
  const { showMessage } = useMessage();
  const { meta } = unref(router.currentRoute);
  const getTitle = {
    icon: meta.icon || 'i-ant-design:book-outlined',
    value: meta.title || t('国际化管理'),
  };

  const moduleList = ref<any[]>([]);

  const searchForm: FormProps = {
    baseColProps: { md: 8, lg: 6 },
    labelWidth: 90,
    schemas: [
      { label: t('语言编码'), field: 'langCode_like', component: 'Input' },
      { label: t('语言译文'), field: 'langText', component: 'Input' },
      {
        label: t('语言类型'),
        field: 'langType',
        component: 'Select',
        componentProps: { dictType: 'sys_lang_type', allowClear: true, onChange: handleSuccess },
      },
      {
        label: t('归属模块'),
        field: 'module.moduleCode',
        component: 'Select',
        componentProps: {
          options: moduleList,
          allowClear: true,
          fieldNames: { label: 'moduleNameText', value: 'moduleCode' },
          onChange: handleSuccess,
        },
      },
    ],
  };

  const tableColumns: BasicColumn[] = [
    { title: t('语言编码'), dataIndex: 'langCode', width: 200, align: 'left', slot: 'firstColumn' },
    { title: t('语言译文'), dataIndex: 'langText', width: 200, align: 'left' },
    { title: t('语言类型'), dataIndex: 'langType', width: 100, align: 'center', dictType: 'sys_lang_type' },
    { title: t('归属模块'), dataIndex: 'module.moduleName', width: 100, align: 'center' },
    { title: t('更新时间'), dataIndex: 'updateDate', width: 130, align: 'center' },
    { title: t('备注信息'), dataIndex: 'remarks', width: 130, align: 'left' },
  ];

  const actionColumn: BasicColumn = {
    width: 130,
    actions: (record: Recordable) => [
      {
        icon: 'i-clarity:note-edit-line',
        title: t('编辑'),
        onClick: handleForm.bind(this, record),
        auth: 'sys:lang:edit',
      },
      {
        icon: 'i-ant-design:delete-outlined',
        color: 'error',
        title: t('删除'),
        popConfirm: { title: t('确认要删除该语言吗？'), confirm: handleDelete.bind(this, record) },
        auth: 'sys:lang:edit',
      },
    ],
  };

  const [registerTable, { reload, getForm }] = useTable({
    api: langListData,
    columns: tableColumns,
    actionColumn: actionColumn,
    formConfig: searchForm,
    showTableSetting: true,
    useSearchForm: true,
    canResize: true,
  });

  const [registerDrawer, { openDrawer }] = useDrawer();

  onMounted(async () => {
    const res = await langList();
    moduleList.value = (res as Recordable)?.moduleList || [];
    getForm().updateSchema({ field: 'module.moduleCode', componentProps: { options: moduleList } });
  });

  function handleForm(record: Recordable) {
    openDrawer(true, record);
  }

  async function handleDelete(record: Recordable) {
    const res = await langDelete({ id: record.id });
    showMessage(res.message);
    handleSuccess();
  }

  async function handleClearCache() {
    const res = await langClearCache();
    showMessage(res.message);
  }

  function handleSuccess() {
    reload();
  }
</script>
