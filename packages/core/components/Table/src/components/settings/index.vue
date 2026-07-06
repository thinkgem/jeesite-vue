<template>
  <div class="table-settings">
    <RedoSetting v-if="getSetting.redo" :getPopupContainer="getTableContainer" />
    <SizeSetting v-if="getSetting.size" :getPopupContainer="getTableContainer" />
    <ColumnSetting
      v-if="getSetting.setting"
      @columns-change="handleColumnChange"
      :getPopupContainer="getTableContainer"
    />
    <FullScreenSetting v-if="getSetting.fullScreen" :getPopupContainer="getTableContainer" />
  </div>
</template>
<script lang="ts" setup name="TableSetting">
  import type { PropType } from 'vue';
  import type { TableSetting, ColumnChangeParam } from '../../types/table';
  import { computed, unref } from 'vue';
  import ColumnSetting from './ColumnSetting.vue';
  import SizeSetting from './SizeSetting.vue';
  import RedoSetting from './RedoSetting.vue';
  import FullScreenSetting from './FullScreenSetting.vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useTableContext } from '../../hooks/useTableContext';

  const props = defineProps({
    setting: {
      type: Object as PropType<TableSetting>,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['columns-change']);

  const { t } = useI18n();
  const table = useTableContext();

  const getSetting = computed((): TableSetting => {
    return {
      redo: false,
      size: true,
      setting: true,
      fullScreen: false,
      ...props.setting,
    };
  });

  function handleColumnChange(data: ColumnChangeParam[]) {
    emit('columns-change', data);
  }

  function getTableContainer() {
    return table ? unref(table.wrapRef) : document.body;
  }
</script>
<style lang="less">
  .table-settings {
    & > * {
      margin-left: 4px;
      margin-right: 5px;
      //margin-top: 6px;
      font-size: 13px;
      //color: #666;
      vertical-align: middle;
    }

    svg {
      width: 1.3em;
      height: 1.3em;
    }
  }

  html[data-theme='dark'] {
    .table-settings {
      color: #c9d1d9;

      svg {
        color: #afafaf;
      }
    }
  }
</style>
