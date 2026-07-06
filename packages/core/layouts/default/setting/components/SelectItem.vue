<template>
  <div class="jeesite-setting-select-item">
    <span> {{ title }}</span>
    <Select
      v-bind="getBindValue"
      class="jeesite-setting-select-item-select"
      @change="handleChange"
      :disabled="disabled"
      size="small"
      :options="options"
    />
  </div>
</template>
<script lang="ts" setup name="SelectItem">
  import { PropType, computed } from 'vue';

  import { Select } from 'antdv-next';
  import { baseHandler } from '../handler';
  import { HandlerEnum } from '../enum';

  const props = defineProps({
    event: {
      type: Number as PropType<HandlerEnum>,
    },
    disabled: {
      type: Boolean,
    },
    title: {
      type: String,
    },
    def: {
      type: [String, Number] as PropType<string | number>,
    },
    initValue: {
      type: [String, Number] as PropType<string | number>,
    },
    options: {
      type: Array as PropType<LabelValueOptions>,
      default: () => [],
    },
  });

  const getBindValue = computed(() => {
    return props.def ? { value: props.def, defaultValue: props.initValue || props.def } : {};
  });

  function handleChange(e: any) {
    props.event && baseHandler(props.event, e);
  }
</script>
<style lang="less">
  .jeesite-setting-select-item {
    display: flex;
    justify-content: space-between;
    margin: 16px 0;
    color: @text-color-base;

    &-select {
      width: 126px;
    }
  }
</style>
