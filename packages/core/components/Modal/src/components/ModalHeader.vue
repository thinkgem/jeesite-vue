<template>
  <BasicTitle :helpMessage="helpMessage">
    {{ title }}
    <slot name="appendHeader"></slot>
  </BasicTitle>
</template>
<script lang="ts" setup name="BasicModalHeader">
  import type { PropType } from 'vue';
  import { BasicTitle } from '@jeesite/core/components/Basic';

  const props = defineProps({
    helpMessage: {
      type: [String, Array] as PropType<string | string[]>,
    },
    title: { type: String },
  });
</script>
