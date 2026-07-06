<template>
  <div class="jeesite-basic-drawer-footer" :style="getStyle" v-if="showFooter || $slots.footer">
    <template v-if="!$slots.footer">
      <slot name="insertFooter"></slot>
      <a-button v-bind="cancelButtonProps" @click="handleClose" class="mr-2" v-if="showCancelBtn">
        <Icon icon="i-ant-design:close-outlined" />
        {{ cancelText || (getShowOkBtn ? t('common.cancelText') : t('common.closeText')) }}
      </a-button>
      <slot name="centerFooter"></slot>
      <a-button
        :type="okType"
        @click="handleOk"
        v-bind="okButtonProps"
        class="mr-2"
        :loading="confirmLoading"
        v-if="getShowOkBtn"
      >
        <Icon icon="i-ant-design:check-outlined" />
        {{ okText || t('common.okText') }}
      </a-button>
      <slot name="appendFooter"></slot>
    </template>

    <template v-else>
      <slot name="footer"></slot>
    </template>
  </div>
</template>
<script lang="ts" setup name="BasicDrawerFooter">
  import { type CSSProperties, computed } from 'vue';
  import { usePermission } from '@jeesite/core/hooks/web/usePermission';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { Icon } from '@jeesite/core/components/Icon';
  import { footerProps } from '../props';

  const props = defineProps({
    ...footerProps,
    height: {
      type: String,
      default: '60px',
    },
  });

  const emit = defineEmits(['ok', 'close']);

  const { t } = useI18n();
  const { hasPermission } = usePermission();

  const getStyle = computed((): CSSProperties => {
    const heightStr = `${props.height}`;
    return {
      height: heightStr,
      lineHeight: heightStr,
    };
  });

  const getShowOkBtn = computed(() => {
    return props.showOkBtn && hasPermission(props.okAuth);
  });

  function handleOk() {
    emit('ok');
  }

  function handleClose() {
    emit('close');
  }
</script>

<style lang="less">
  .jeesite-basic-drawer-footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding-right: 8px;
    text-align: right;
    background-color: @component-background;
    // border-top: 1px solid @border-color-base;
    z-index: 100; // 设置下，否则 BasicTable 空白图标会覆盖 actions 上边框线

    > * {
      margin-right: 8px;
    }
  }
</style>
