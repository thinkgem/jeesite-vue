<template>
  <Drawer
    v-if="getIsMobile"
    placement="left"
    class="jeesite-layout-sider-wrapper"
    :width="getMenuWidth"
    :getContainer="false"
    :open="!getCollapsed"
    @close="handleClose"
  >
    <Sider />
  </Drawer>
  <MixSider v-else-if="getIsMixSidebar" />
  <Sider v-else />
</template>
<script lang="ts" setup name="SiderWrapper">
  import Sider from './LayoutSider.vue';
  import MixSider from './MixSider.vue';
  import { Drawer } from 'antdv-next';

  import { useAppInject } from '@jeesite/core/hooks/web/useAppInject';
  import { useMenuSetting } from '@jeesite/core/hooks/setting/useMenuSetting';

  const { getIsMobile } = useAppInject();
  const { setMenuSetting, getCollapsed, getMenuWidth, getIsMixSidebar } = useMenuSetting();

  function handleClose() {
    setMenuSetting({
      collapsed: true,
    });
  }
</script>
<style lang="less">
  .jeesite-layout-sider-wrapper {
    .ant-drawer-body {
      height: 100vh;
      padding: 0;
    }

    .ant-drawer-header-no-title {
      display: none;
    }
  }
</style>
