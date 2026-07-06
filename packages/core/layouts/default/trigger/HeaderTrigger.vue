<template>
  <span :class="['jeesite-layout-header-trigger', theme]" @click="toggleCollapsed">
    <MenuUnfoldOutlined v-if="getCollapsed" /> <MenuFoldOutlined v-else />
  </span>
</template>
<script lang="ts" setup name="HeaderTrigger">
  import { MenuUnfoldOutlined, MenuFoldOutlined } from '@antdv-next/icons';
  import { useMenuSetting } from '@jeesite/core/hooks/setting/useMenuSetting';
  import { propTypes } from '@jeesite/core/utils/propTypes';

  defineProps({
    theme: propTypes.oneOf(['light', 'dark']),
  });

  const { getCollapsed, toggleCollapsed } = useMenuSetting();
</script>
