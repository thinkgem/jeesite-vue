<!--
 Access control component for fine-grained access control.
-->
<template>
  <slot v-if="showSlot"></slot>
</template>
<script lang="ts" setup name="Authority">
  import type { PropType } from 'vue';
  import { computed } from 'vue';
  import { RoleEnum } from '@jeesite/core/enums/roleEnum';
  import { usePermission } from '@jeesite/core/hooks/web/usePermission';

  const props = defineProps({
    /**
     * Specified role is open
     * When the permission mode is the role mode, the value value can pass the role value.
     * When the permission mode is background, the value value can pass the code permission value
     * @default ''
     */
    value: {
      type: [Number, Array, String] as PropType<RoleEnum | RoleEnum[] | string | string[]>,
      default: '',
    },
  });

  const { hasPermission } = usePermission();

  const showSlot = computed(() => {
    if (!props.value) return true;
    return hasPermission(props.value);
  });
</script>
