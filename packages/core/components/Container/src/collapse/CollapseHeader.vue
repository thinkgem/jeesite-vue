<template>
  <div
    :class="[`${prefixCls}__header px-2 py-5`, $attrs.class, { 'cursor-pointer': canExpan }]"
    @click="$emit('expand')"
  >
    <BasicTitle :helpMessage="helpMessage" normal>
      <template v-if="title">
        {{ title }}
      </template>
      <template v-else>
        <slot name="title"></slot>
      </template>
    </BasicTitle>
    <div :class="`${prefixCls}__action`">
      <slot name="action"></slot>
      <BasicArrow v-if="canExpan" up :expand="show" />
    </div>
  </div>
</template>
<script lang="ts" setup name="CollapseHeader">
  import { BasicArrow, BasicTitle } from '@jeesite/core/components/Basic';

  defineOptions({
    inheritAttrs: false,
  });

  const props = defineProps({
    prefixCls: { type: String },
    helpMessage: {
      type: [Array, String] as PropType<string[] | string>,
      default: '',
    },
    title: { type: String },
    show: { type: Boolean },
    canExpan: { type: Boolean },
  });

  const emit = defineEmits(['expand']);
</script>
