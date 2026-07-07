<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <div class="jeesite-state-server">
    <!-- CPU / 内存 / 堆非堆 -->
    <Row :gutter="[16, 16]">
      <Col :xs="24" :sm="24" :md="8">
        <Card :loading="rtLoading" variant="borderless">
          <template #title>
            <Icon icon="icon-speedometer" class="pr-1 text-primary" />
            <span>CPU</span>
          </template>
          <BasicTable
            :data-source="cpuTableData"
            :columns="cpuColumns"
            :pagination="false"
            :bordered="false"
            size="small"
            inset
            :show-search-form="false"
            :show-index-column="false"
            auto-create-key
          >
            <template #headerCell="{ column }">
              {{ column.title }}
            </template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'value'">
                <UsageTag :value="record.value" />
              </template>
            </template>
          </BasicTable>
        </Card>
      </Col>

      <Col :xs="24" :sm="24" :md="8">
        <Card :loading="rtLoading" variant="borderless">
          <template #title>
            <Icon icon="icon-fire" class="pr-1 text-primary" />
            <span>{{ t('内存') }}</span>
          </template>
          <BasicTable
            :data-source="memTableData"
            :columns="memColumns"
            :pagination="false"
            :bordered="false"
            size="small"
            inset
            :show-search-form="false"
            :show-index-column="false"
            auto-create-key
          >
            <template #headerCell="{ column }">
              {{ column.title }}
            </template>
          </BasicTable>
        </Card>
      </Col>

      <Col :xs="24" :sm="24" :md="8">
        <Card :loading="rtLoading" variant="borderless">
          <template #title>
            <Icon icon="icon-puzzle" class="pr-1 text-primary" />
            <span>{{ t('堆/非堆') }}</span>
          </template>
          <template #extra>
            <Button size="small" :loading="gcLoading" @click="handleGc">
              <Icon icon="icon-eraser" class="pr-1 text-primary" /> {{ t('执行GC') }}
            </Button>
          </template>
          <BasicTable
            :data-source="heapTableData"
            :columns="heapColumns"
            :pagination="false"
            :bordered="false"
            size="small"
            inset
            :show-search-form="false"
            :show-index-column="false"
            auto-create-key
          >
            <template #headerCell="{ column }">
              {{ column.title }}
            </template>
          </BasicTable>
        </Card>
      </Col>
    </Row>

    <!-- 服务器信息 -->
    <Card variant="borderless" class="mt-4" :loading="infoLoading">
      <template #title>
        <Icon icon="icon-screen-tablet" class="pr-1 text-primary" />
        <span>{{ t('服务器信息') }}</span>
      </template>
      <BasicTable
        :data-source="serverInfoTableData"
        :columns="serverInfoColumns"
        :pagination="false"
        :bordered="false"
        :showHeader="false"
        size="small"
        inset
        :show-search-form="false"
        :show-index-column="false"
        auto-create-key
      />
    </Card>

    <!-- Java虚拟机信息 -->
    <Card variant="borderless" class="mt-4" :loading="infoLoading">
      <template #title>
        <Icon icon="icon-cup" class="pr-1 text-primary" />
        <span>{{ t('Java虚拟机信息') }}</span>
      </template>
      <BasicTable
        :data-source="jvmInfoTableData"
        :columns="jvmInfoColumns"
        :pagination="false"
        :bordered="false"
        :showHeader="false"
        size="small"
        inset
        :show-search-form="false"
        :show-index-column="false"
        auto-create-key
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'value1' && record.value1List">
            <div class="font-mono" style="white-space: normal; word-break: break-all">
              <div v-for="(arg, idx) in record.value1List" :key="idx">{{ arg }}</div>
            </div>
          </template>
          <template v-else>
            {{ record[column.dataIndex] }}
          </template>
        </template>
      </BasicTable>
    </Card>

    <!-- 平台参数 -->
    <Card variant="borderless" class="mt-4" :loading="infoLoading">
      <template #title>
        <Icon icon="icon-eyeglass" class="pr-1 text-primary" />
        <span>{{ t('平台参数') }}</span>
      </template>
      <BasicTable
        :data-source="platformTableData"
        :columns="infoColumns"
        :pagination="false"
        :bordered="false"
        size="small"
        inset
        :show-search-form="false"
        :show-index-column="false"
        auto-create-key
      >
        <template #headerCell="{ column }">
          {{ column.title }}
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'value'">
            {{ record.value }}
          </template>
        </template>
      </BasicTable>
    </Card>

    <!-- 磁盘状态 -->
    <Card variant="borderless" class="mt-4" :loading="infoLoading">
      <template #title>
        <Icon icon="icon-drawer" class="pr-1 text-primary" />
        <span>{{ t('磁盘状态') }}</span>
      </template>
      <BasicTable
        :data-source="diskTableData"
        :columns="diskColumns"
        :pagination="false"
        :bordered="false"
        size="small"
        inset
        :show-search-form="false"
        :show-index-column="true"
        row-key="mount"
        auto-create-key
      >
        <template #headerCell="{ column }">
          {{ column.title }}
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'usedPerc'">
            <UsageTag :value="record.usedPerc" />
          </template>
        </template>
      </BasicTable>
    </Card>
  </div>
</template>

<script lang="ts" setup name="ViewsStateServerIndex">
  import { ref, reactive, computed, onMounted, onUnmounted, h } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicTable } from '@jeesite/core/components/Table';
  import { useIntervalFn } from '@vueuse/core';
  import { Row, Col, Card, Button, Tag } from 'antdv-next';
  import { stateServerInfo, stateServerRtInfo, stateServerGc } from '@jeesite/core/api/state/server';
  import type { ServerData, RtInfo } from '@jeesite/core/api/state/server';

  const { t } = useI18n('state.server');
  const { showMessage } = useMessage();

  const infoLoading = ref(false);
  const rtLoading = ref(false);
  const gcLoading = ref(false);
  const serverData = reactive<ServerData>({});
  const rtData = reactive<RtInfo>({
    cpu: {},
    mem: {},
    jvm: {},
  });

  // 使用率颜色标签组件
  const UsageTag = (props: { value?: string }) => {
    const v = props.value || '';
    if (v && v.endsWith('%') && v !== '0%' && v !== '0.0%') {
      const num = parseFloat(v.replace('%', ''));
      if (num > 80) {
        return h(Tag, { color: 'red' }, () => v);
      }
      return h(Tag, { color: 'green' }, () => v);
    }
    return h('span', v);
  };

  // CPU 表格
  const cpuColumns = [
    { title: t('属性'), dataIndex: 'label', key: 'label', align: 'center' as const, width: '40%' },
    { title: t('值'), dataIndex: 'value', key: 'value', align: 'center' as const, width: '60%' },
  ];
  const cpuTableData = computed(() => [
    {
      key: 'cpuNum',
      label: String(t('核心个数')),
      value: `${rtData.cpu?.cpuNum ?? 0} / ${rtData.cpu?.cpuLogicalNum ?? 0}`,
    },
    { key: 'maxGhz', label: String(t('核心频率')), value: rtData.cpu?.maxGhz || '0GHz' },
    {
      key: 'sysUserPerc',
      label: String(t('系统/用户')),
      value: `${rtData.cpu?.sysPerc || '0%'} / ${rtData.cpu?.userPerc || '0%'}`,
    },
    { key: 'usedPerc', label: String(t('总使用率')), value: rtData.cpu?.usedPerc || '0%' },
  ]);

  // 内存对比表格
  const memColumns = [
    { title: t('属性'), dataIndex: 'label', key: 'label', align: 'center' as const, width: '33%' },
    { title: t('内存'), dataIndex: 'mem', key: 'mem', align: 'center' as const, width: '33%' },
    { title: 'JVM', dataIndex: 'jvm', key: 'jvm', align: 'center' as const, width: '33%' },
  ];
  const memTableData = computed(() => [
    { label: String(t('总内存')), mem: rtData.mem?.total || '0MB', jvm: rtData.jvm?.total || '0MB' },
    { label: String(t('已用内存')), mem: rtData.mem?.used || '0MB', jvm: rtData.jvm?.used || '0MB' },
    { label: String(t('剩余内存')), mem: rtData.mem?.free || '0MB', jvm: rtData.jvm?.free || '0MB' },
    { label: String(t('使用率')), mem: rtData.mem?.usedPerc || '0%', jvm: rtData.jvm?.usedPerc || '0%' },
  ]);

  // 堆/非堆对比表格
  const heapColumns = [
    { title: t('属性'), dataIndex: 'label', key: 'label', align: 'center' as const, width: '33%' },
    { title: t('堆'), dataIndex: 'heap', key: 'heap', align: 'center' as const, width: '33%' },
    { title: t('非堆'), dataIndex: 'nonHeap', key: 'nonHeap', align: 'center' as const, width: '33%' },
  ];
  const heapTableData = computed(() => [
    { label: String(t('初始大小')), heap: rtData.jvm?.heapInit || '0MB', nonHeap: rtData.jvm?.nonHeapInit || '0MB' },
    { label: String(t('最大内存')), heap: rtData.jvm?.heapMax || '0GB', nonHeap: rtData.jvm?.nonHeapMax || '0GB' },
    { label: String(t('已用内存')), heap: rtData.jvm?.heapUsed || '0MB', nonHeap: rtData.jvm?.nonHeapUsed || '0MB' },
    {
      label: String(t('可用内存')),
      heap: rtData.jvm?.heapAvailable || '0GB',
      nonHeap: rtData.jvm?.nonHeapAvailable || '0GB',
    },
  ]);

  // 服务器信息表格
  const serverInfoColumns = [
    { title: 'label1', dataIndex: 'label1', key: 'label1', align: 'center' as const, width: '15%' },
    { title: 'value1', dataIndex: 'value1', key: 'value1', align: 'left' as const, width: '35%' },
    { title: 'label2', dataIndex: 'label2', key: 'label2', align: 'center' as const, width: '15%' },
    { title: 'value2', dataIndex: 'value2', key: 'value2', align: 'left' as const, width: '35%' },
  ];
  const serverInfoTableData = computed(() => [
    {
      label1: String(t('服务器名称')),
      value1: serverData.server?.hostName || '',
      label2: String(t('操作系统')),
      value2: `${serverData.server?.osName || ''}, ${String(t('版本'))} ${serverData.server?.osVersion || ''}`,
    },
    {
      label1: String(t('服务器IP')),
      value1: serverData.server?.hostAddress || '',
      label2: String(t('系统架构')),
      value2: serverData.server?.osArch || '',
    },
  ]);

  // 信息类表格共享列定义
  const infoColumns = [
    { title: t('属性'), dataIndex: 'label', key: 'label', align: 'center' as const, width: '20%' },
    { title: t('值'), dataIndex: 'value', key: 'value', align: 'left' as const, width: '80%' },
  ];

  // Java虚拟机信息表格
  function jvmCellColSpan(record: any, col: string) {
    if (!record.colSpan) return {};
    if (col === 'value1') return { colSpan: 3 };
    if (col === 'label2' || col === 'value2') return { colSpan: 0 };
    return {};
  }
  const jvmInfoColumns = [
    { title: 'label1', dataIndex: 'label1', key: 'label1', align: 'center' as const, width: '15%' },
    {
      title: 'value1',
      dataIndex: 'value1',
      key: 'value1',
      align: 'left' as const,
      width: '35%',
      onCell: (record: any) => jvmCellColSpan(record, 'value1'),
    },
    {
      title: 'label2',
      dataIndex: 'label2',
      key: 'label2',
      align: 'center' as const,
      width: '15%',
      onCell: (record: any) => jvmCellColSpan(record, 'label2'),
    },
    {
      title: 'value2',
      dataIndex: 'value2',
      key: 'value2',
      align: 'left' as const,
      width: '35%',
      onCell: (record: any) => jvmCellColSpan(record, 'value2'),
    },
  ];
  const jvmInfoTableData = computed(() => [
    {
      label1: String(t('Java名称')),
      value1: serverData.server?.javaName || '',
      label2: String(t('Java版本')),
      value2: `${serverData.server?.javaVersion || ''}, ${String(t('供应商'))} ${serverData.server?.javaVendor || ''}`,
    },
    {
      label1: String(t('启动时间')),
      value1: serverData.server?.startTime || '',
      label2: String(t('运行时长')),
      value2: serverData.server?.uptime || '',
    },
    { label1: String(t('安装路径')), value1: serverData.server?.javaHome || '', label2: '', value2: '', colSpan: true },
    {
      label1: String(t('启动参数')),
      value1: '',
      value1List: serverData.server?.javaArgs || [],
      label2: '',
      value2: '',
      colSpan: true,
    },
  ]);

  // 平台参数表格
  const platformTableData = computed(() => [
    { key: 'userDir', label: String(t('当前工作路径')), value: serverData.server?.userDir || '' },
    { key: 'logPath', label: String(t('日志存放路径')), value: serverData.server?.logPath || '' },
    { key: 'userfilesDir', label: String(t('上传文件路径')), value: serverData.server?.userfilesDir || '' },
  ]);

  // 磁盘表格（序号列由 showIndexColumn 自动生成）
  const diskColumns = [
    { title: t('盘符名称'), dataIndex: 'name', key: 'name', align: 'center' as const },
    { title: t('盘符路径'), dataIndex: 'mount', key: 'mount', align: 'center' as const },
    { title: t('文件系统'), dataIndex: 'type', key: 'type', align: 'center' as const },
    { title: t('总大小'), dataIndex: 'total', key: 'total', align: 'center' as const },
    { title: t('可用大小'), dataIndex: 'avail', key: 'avail', align: 'center' as const },
    { title: t('已用大小'), dataIndex: 'used', key: 'used', align: 'center' as const },
    { title: t('已用百分比'), dataIndex: 'usedPerc', key: 'usedPerc', align: 'center' as const },
  ];
  const diskTableData = computed(() => serverData.diskList || []);

  // 获取实时数据
  async function fetchRtInfo() {
    const data = await stateServerRtInfo();
    if (data) {
      Object.assign(rtData, data);
    }
    rtLoading.value = false;
  }

  // 获取静态信息
  async function fetchServerInfo() {
    infoLoading.value = true;
    const data = await stateServerInfo();
    if (data) {
      Object.assign(serverData, data);
    }
    infoLoading.value = false;
  }

  // 执行 GC
  async function handleGc() {
    gcLoading.value = true;
    const data = await stateServerGc();
    if (data) {
      showMessage(data.message);
    }
    gcLoading.value = false;
  }

  // 3 秒轮询实时数据
  const { resume, pause } = useIntervalFn(fetchRtInfo, 3000);

  onMounted(async () => {
    rtLoading.value = true;
    await Promise.all([fetchServerInfo(), fetchRtInfo()]);
    resume();
  });

  onUnmounted(() => {
    pause();
  });
</script>

<style lang="less">
  .jeesite-state-server {
    .ant-card {
      .ant-card-head {
        min-height: 45px;
        padding: 0 15px;
      }

      .ant-card-body {
        border-top: 1px solid #f0f0f0;
        padding: 0;
      }
    }
    // 仅显示表格行线，无外框和竖线，末尾行圆角
    .ant-table-small {
      border: none;
      border-radius: 10px;

      .ant-table-thead > tr > th {
        border-inline-end: none;
        background: #fafafa;
      }

      .ant-table-tbody > tr > td {
        border-inline-end: none;
        border-bottom: 1px solid #f0f0f0;
      }

      .ant-table-tbody > tr:last-child > td {
        &:first-child {
          border-bottom-left-radius: 10px;
        }

        &:last-child {
          border-bottom-right-radius: 10px;
        }
      }
    }
  }

  html[data-theme='dark'] {
    .jeesite-state-server {
      .ant-card {
        background: #141414;

        .ant-card-body {
          border-top-color: #303030;
        }
      }

      .ant-table-small {
        .ant-table-thead > tr > th {
          background: #1d1d1d;
        }

        .ant-table-tbody > tr > td {
          border-bottom-color: #303030;
        }
      }
    }
  }
</style>
