<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
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
        <a-button type="primary" @click="handleForm({})" v-auth="'test:testData:edit'">
          <Icon icon="i-fluent:add-12-filled" /> {{ t('新增') }}
        </a-button>
      </template>
      <template #firstColumn="{ record }">
        <a @click="handleForm({ id: record.id })">
          {{ record.testInput }}
        </a>
      </template>
      <template #expandedRowRender="{ record }">
        <div>编号: {{ record.id }}（这里生成内容自定义，也可以加载子表）</div>
      </template>
      <template #customFilterIcon="filter">
        <Icon icon="i-ant-design:search-outlined" :style="{ color: filter.filtered ? '#108ee9' : undefined }" />
      </template>
      <template #customFilterDropdown="filter">
        <div class="p-2" v-if="filter.column.dataIndex == 'testInput'">
          <a-input
            ref="searchInput"
            :placeholder="`${t('搜索')}${filter.column.customTitle}`"
            :value="filter.selectedKeys[0]"
            style="width: 168px; margin-bottom: 8px; display: block"
            @change="(e: any) => filter.setSelectedKeys(e.target.value ? [e.target.value] : [])"
          />
          <a-button type="primary" size="small" class="mr-2 w-20" @click="filter.confirm()">
            {{ t('确定') }}
          </a-button>
          <a-button
            size="small"
            class="w-20"
            @click="
              filter.clearFilters();
              filter.confirm();
            "
          >
            {{ t('重置') }}
          </a-button>
        </div>
      </template>
    </BasicTable>
    <InputForm @register="registerDrawer" @success="handleSuccess" />
    <InputFormTabs @register="registerDrawerTabs" @success="handleSuccess" />
    <InputFormModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup name="ViewsTestTestDataList">
  import { unref } from 'vue';
  import { useEmitter } from '@jeesite/core/store/modules/user';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { useGo } from '@jeesite/core/hooks/web/usePage';
  import { router } from '@jeesite/core/router';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicTable, BasicColumn, useTable } from '@jeesite/core/components/Table';
  import { testDataDelete, testDataListData } from '@jeesite/test/api/test/testData';
  import { testDataDisable, testDataEnable } from '@jeesite/test/api/test/testData';
  import { officeTreeData } from '@jeesite/core/api/sys/office';
  import { areaTreeData } from '@jeesite/core/api/sys/area';
  import { useDrawer } from '@jeesite/core/components/Drawer';
  import { useModal } from '@jeesite/core/components/Modal';
  import { FormProps } from '@jeesite/core/components/Form';
  import InputForm from './form.vue';
  import InputFormTabs from './formTabs.vue';
  import InputFormModal from './formModal.vue';
  // import { dateUtil, formatToDateTime } from '@jeesite/core/utils/dateUtil';

  const emitter = useEmitter();

  const { t } = useI18n('test.testData');
  const { meta } = unref(router.currentRoute);
  const { showMessage } = useMessage();

  const getTitle = {
    icon: meta.icon || 'ant-design:book-outlined',
    value: meta.title || t('数据管理'),
  };
  const go = useGo();

  const searchForm: FormProps = {
    baseColProps: { md: 8, lg: 6 },
    labelWidth: 90,
    schemas: [
      {
        label: t('单行文本'),
        field: 'testInput',
        component: 'Input',
      },
      {
        label: t('多行文本'),
        field: 'testTextarea',
        component: 'Input',
      },
      {
        label: t('下拉框'),
        field: 'testSelect',
        component: 'Select',
        componentProps: {
          dictType: 'sys_menu_type',
          allowClear: true,
        },
      },
      {
        label: t('下拉多选'),
        field: 'testSelectMultiple',
        component: 'Select',
        componentProps: {
          dictType: 'sys_menu_type',
          allowClear: true,
          mode: 'multiple',
        },
      },
      {
        label: t('单选框'),
        field: 'testRadio',
        component: 'RadioGroup',
        componentProps: {
          dictType: 'sys_menu_type',
        },
      },
      {
        label: t('复选框'),
        field: 'testCheckbox',
        component: 'CheckboxGroup',
        componentProps: {
          dictType: 'sys_menu_type',
        },
      },
      {
        label: t('日期选择起'),
        field: 'testDate_gte',
        component: 'DatePicker',
        componentProps: {
          format: 'YYYY-MM-DD',
          showTime: false,
        },
        // defaultValue: dateUtil(new Date()),
        // defaultValue: formatToDateTime(new Date()),
        // defaultValue: '2024-05-31',
      },
      {
        label: t('日期选择止'),
        field: 'testDate_lte',
        component: 'DatePicker',
        componentProps: {
          format: 'YYYY-MM-DD',
          showTime: false,
        },
      },
      {
        label: t('用户选择'),
        field: 'testUser.userCode',
        component: 'TreeSelect',
        componentProps: {
          api: officeTreeData,
          params: { isLoadUser: true, userIdPrefix: '' },
          canSelectParent: false,
          allowClear: true,
        },
      },
      {
        label: t('机构选择'),
        field: 'testOffice.officeCode',
        component: 'TreeSelect',
        componentProps: {
          api: officeTreeData,
          allowClear: true,
        },
      },
      {
        label: t('区域选择'),
        field: 'testAreaCode',
        component: 'TreeSelect',
        componentProps: {
          api: areaTreeData,
          allowClear: true,
        },
      },
      {
        label: t('状态'),
        field: 'status',
        component: 'Select',
        componentProps: {
          dictType: 'sys_search_status',
          allowClear: true,
          onChange: handleSuccess,
        },
      },
      {
        label: t('备注信息'),
        field: 'remarks',
        component: 'Input',
      },
      {
        label: t('日期时间'),
        field: 'dateRange',
        component: 'RangePicker',
      },
    ],
    fieldMapToTime: [['dateRange', ['testDatetime_gte', 'testDatetime_lte']]],
  };

  const tableColumns: BasicColumn[] = [
    {
      title: t('单行文本'),
      dataIndex: 'testInput',
      key: 'a.test_input',
      sorter: true,
      width: 130,
      align: 'center',
      slot: 'firstColumn',
      // 方式一：简单配置过滤窗口
      // filters: [
      //   { text: 'Male', value: '1' },
      //   { text: 'Female', value: '2' },
      // ],
      // filterMultiple: true,
      // onFilter: (value: string, record: Recordable) => {
      //   console.log('onFilter', value, record);
      //   return record.userName === value;
      // },
      // 方式一：简单配置过滤窗口
      customFilterDropdown: true,
    },
    {
      title: t('多行文本'),
      dataIndex: 'testTextarea',
      key: 'a.test_textarea',
      sorter: true,
      width: 130,
      align: 'left',
      // 根据数据状态改变单元格的颜色（例子）
      customCell: (record: Recordable) => {
        const color = record.status === '2' ? '#f8d8d8' : '';
        return {
          // innerHTML: record.testTextarea, // 原样输出，不进行html编码（例子）
          style: `background-color: ${color} !important`,
        };
      },
    },
    {
      title: t('下拉框'),
      dataIndex: 'testSelect',
      key: 'a.test_select',
      sorter: true,
      width: 130,
      align: 'center',
      dictType: 'sys_menu_type',
    },
    {
      title: t('下拉多选'),
      dataIndex: 'testSelectMultiple',
      key: 'a.test_select_multiple',
      sorter: true,
      width: 130,
      align: 'center',
      dictType: 'sys_menu_type',
    },
    {
      title: t('单选框'),
      dataIndex: 'testRadio',
      key: 'a.test_radio',
      sorter: true,
      width: 130,
      align: 'center',
      dictType: 'sys_menu_type',
    },
    {
      title: t('复选框'),
      dataIndex: 'testCheckbox',
      key: 'a.test_checkbox',
      sorter: true,
      width: 130,
      align: 'center',
      dictType: 'sys_menu_type',
    },
    {
      title: t('日期选择'),
      dataIndex: 'testDate',
      key: 'a.test_date',
      sorter: true,
      width: 130,
      align: 'center',
    },
    {
      title: t('日期时间'),
      dataIndex: 'testDatetime',
      key: 'a.test_datetime',
      sorter: true,
      width: 130,
      align: 'center',
    },
    {
      title: t('用户选择'),
      dataIndex: 'testUser.userName',
      key: 'a.test_user_code',
      sorter: true,
      width: 130,
      align: 'left',
    },
    {
      title: t('机构选择'),
      dataIndex: 'testOffice.officeName',
      key: 'a.test_office_code',
      sorter: true,
      width: 130,
      align: 'left',
    },
    {
      title: t('区域选择'),
      dataIndex: 'testAreaName',
      key: 'a.test_area_code',
      sorter: true,
      width: 130,
      align: 'left',
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      key: 'a.status',
      sorter: true,
      width: 130,
      align: 'center',
      dictType: 'sys_status',
    },
    {
      title: t('更新时间'),
      dataIndex: 'updateDate',
      key: 'a.update_date',
      sorter: true,
      width: 130,
      align: 'center',
    },
    {
      title: t('备注信息'),
      dataIndex: 'remarks',
      key: 'a.remarks',
      sorter: true,
      width: 130,
      align: 'left',
    },
  ];

  const actionColumn: BasicColumn = {
    width: 250,
    actions: (record: Recordable) => [
      {
        icon: 'i-clarity:note-edit-line',
        title: t('抽屉模式编辑'),
        onClick: handleForm.bind(this, { id: record.id }),
        auth: 'test:testData:edit',
      },
      {
        icon: 'i-clarity:timeline-line',
        title: t('表单页签编辑'),
        onClick: handleFormTabs.bind(this, { id: record.id }),
        auth: 'test:testData:edit',
      },
      {
        icon: 'i-ant-design:file-markdown-outlined',
        title: t('弹窗模式编辑'),
        onClick: handleFormModal.bind(this, { id: record.id }),
        auth: 'test:testData:edit',
      },
      {
        icon: 'i-ant-design:layout-outlined',
        title: t('路由模式编辑'),
        onClick: handleFormRoute.bind(this, { id: record.id }),
        auth: 'test:testData:edit',
      },
      {
        icon: 'i-ant-design:stop-outlined',
        color: 'error',
        title: t('停用数据'),
        popConfirm: {
          title: t('是否确认停用数据'),
          confirm: handleDisable.bind(this, { id: record.id }),
        },
        auth: 'test:testData:edit',
        ifShow: () => record.status === '0',
      },
      {
        icon: 'i-ant-design:check-circle-outlined',
        color: 'success',
        title: t('启用数据'),
        popConfirm: {
          title: t('是否确认启用数据'),
          confirm: handleEnable.bind(this, { id: record.id }),
        },
        auth: 'test:testData:edit',
        ifShow: () => record.status === '2',
      },
      {
        icon: 'i-ant-design:delete-outlined',
        color: 'error',
        title: t('删除数据'),
        popConfirm: {
          title: t('是否确认删除数据'),
          confirm: handleDelete.bind(this, { id: record.id }),
        },
        auth: 'test:testData:edit',
      },
    ],
  };

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerDrawerTabs, { openDrawer: openDrawerTabs }] = useDrawer();
  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload /*, getForm*/ }] = useTable({
    api: testDataListData,
    beforeFetch: (params) => {
      // 查询前增加默认条件（例子）
      // params.testDate_gte = '2022-05-31';
      // getForm().setFieldsValue(params);
      return params;
    },
    columns: tableColumns,
    actionColumn: actionColumn,
    formConfig: searchForm,
    showTableSetting: true,
    useSearchForm: true,
    canResize: true,
    // 设置为true可以通过点击行来展开 expandedRowRender 插槽（例子）
    expandRowByClick: false,
    // 给单行文本列标题上添加一个过滤按钮，提交到后台过滤（例子）
    filterFn: (data: Partial<Recordable<string[]>>) => {
      const testInput = 'a.test_input';
      if (data[testInput]) {
        data['testInput'] = data[testInput]?.join(',') as any;
        delete data[testInput];
      }
      console.log(data);
      return data;
    },
    // 根据数据状态改变行的颜色（例子）
    rowClassName: (record: Recordable) => {
      return record.status === '2' ? 'table-tr-red' : '';
    },
  });

  function handleForm(record: Recordable) {
    openDrawer(true, record);
  }

  function handleFormTabs(record: Recordable) {
    openDrawerTabs(true, record);
  }

  function handleFormModal(record: Recordable) {
    openModal(true, record);
  }

  function handleFormRoute(record: Recordable) {
    go({
      path: '/test/testData/formRoute',
      query: record,
    });
  }

  async function handleDisable(record: Recordable) {
    const res = await testDataDisable(record);
    showMessage(res.message);
    handleSuccess();
  }

  async function handleEnable(record: Recordable) {
    const res = await testDataEnable(record);
    showMessage(res.message);
    handleSuccess();
  }

  async function handleDelete(record: Recordable) {
    const res = await testDataDelete(record);
    showMessage(res.message);
    handleSuccess();
  }

  function handleSuccess() {
    reload();
  }

  emitter.on('test-testData-reload', reload, true);
</script>
<style lang="less">
  .table-tr-red {
    td {
      background-color: #fde7e7 !important;
    }
  }
</style>
