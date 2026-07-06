<template>
  <MenuItem :key="itemKey">
    <span class="flex items-center">
      <Icon v-if="icon" :icon="icon" class="mr-1" />
      <span>{{ text }}</span>
      <slot name="menuItemAfter"></slot>
    </span>
  </MenuItem>
</template>
<script lang="ts" setup name="DropdownMenuItem">
  import { Menu } from 'antdv-next';

  import { computed, getCurrentInstance } from 'vue';

  import Icon from '@jeesite/core/components/Icon';
  import { propTypes } from '@jeesite/core/utils/propTypes';

  const MenuItem = Menu.Item;

  const props = defineProps({
    value: propTypes.string,
    text: propTypes.string,
    icon: propTypes.string,
  });

  const instance = getCurrentInstance();
  const itemKey = computed(() => props.value || instance?.vnode?.props?.value);
</script>
