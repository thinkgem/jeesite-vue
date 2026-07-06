<template>
  <BasicTitle class="jeesite-basic-table-title" v-if="getTitle" :helpMessage="helpMessage">
    {{ getTitle }}
  </BasicTitle>
</template>
<script lang="ts" setup name="BasicTableTitle">
  import { computed, PropType } from 'vue';
  import { BasicTitle } from '@jeesite/core/components/Basic';
  import { isFunction } from '@jeesite/core/utils/is';

  const props = defineProps({
    title: {
      type: [Function, String] as PropType<string | ((data: Recordable) => string)>,
    },
    getSelectRows: {
      type: Function as PropType<() => Recordable[]>,
    },
    helpMessage: {
      type: [String, Array] as PropType<string | string[]>,
    },
  });

  const getTitle = computed(() => {
    const { title, getSelectRows = () => {} } = props;
    let tit = title;

    if (isFunction(title)) {
      tit = title({
        selectRows: getSelectRows(),
      });
    }
    return tit;
  });
</script>
<style lang="less">
  .jeesite-basic-table-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
