<template>
  <div class="jeesite-setting-switch-item">
    <span>
      {{ title }}
      <BasicHelp v-if="helpMessage" placement="top" :text="helpMessage" />
    </span>
    <Switch
      v-bind="getBindValue"
      @change="handleChange"
      :disabled="disabled"
      :checkedChildren="t('layout.setting.on')"
      :unCheckedChildren="t('layout.setting.off')"
    />
  </div>
</template>
<script lang="ts" setup name="SwitchItem">
  import { PropType, computed } from 'vue';

  import { Switch } from 'antdv-next';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { BasicHelp } from '@jeesite/core/components/Basic';
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
    helpMessage: {
      type: String,
    },
    def: {
      type: Boolean,
    },
  });

  const { t } = useI18n();

  const getBindValue = computed(() => {
    return props.def ? { checked: props.def } : {};
  });
  function handleChange(e: any) {
    props.event && baseHandler(props.event, e);
  }
</script>
<style lang="less">
  .jeesite-setting-switch-item {
    display: flex;
    justify-content: space-between;
    margin: 16px 0;
    color: @text-color-base;
  }
</style>
