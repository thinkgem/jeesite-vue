<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author Vben、ThinkGem
-->
<template>
  <div v-bind="$attrs" class="jeesite-form-group">
    <div :class="`title ${props.collapsed !== undefined ? 'cursor-pointer' : ''}`" @click="handleTitleClick">
      <slot></slot>
      <Icon
        v-if="props.collapsed !== undefined"
        class="pl-2"
        :icon="innerCollapsed ? 'i-ant-design:plus-circle-outlined' : 'i-ant-design:minus-circle-outlined'"
      />
    </div>
  </div>
</template>
<script lang="ts" setup name="JeeSiteFormGroup">
  import { PropType, ref, watchEffect } from 'vue';
  import { Icon } from '@jeesite/core/components/Icon';

  const props = defineProps({
    collapsed: {
      type: [Boolean, undefined] as PropType<boolean | undefined>,
      default: undefined,
    },
  });

  const emit = defineEmits(['collapsed']);

  const innerCollapsed = ref<boolean>(false);

  watchEffect(() => {
    innerCollapsed.value = !!props.collapsed;
  });

  function handleTitleClick() {
    innerCollapsed.value = !innerCollapsed.value;
    emit('collapsed', innerCollapsed.value);
  }
</script>
<style lang="less">
  @prefix-cls: ~'jeesite-form-group';

  .@{prefix-cls} {
    position: relative;

    .title {
      //width: 100%;
      font-size: 15px;
      //font-style: oblique;
      padding: 0 0 3px 8px;
      margin: 0 0 20px 15px;
      border-bottom: 1px solid @header-light-bottom-border-color;
      color: fade(@primary-color, 90%);
    }

    &::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 15px;
      width: 3px;
      height: 17px;
      background-color: fade(@primary-color, 80%);
      border-radius: 4px;
    }

    @media (max-width: @screen-sm) {
      .title {
        margin-left: 0;
      }

      &::before {
        left: 0;
      }
    }
  }
</style>
