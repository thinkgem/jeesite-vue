<template>
  <div @click="openDrawer(true)">
    <Icon icon="i-ion:settings-outline" />
    <SettingDrawer @register="register" />
  </div>
</template>
<script lang="ts" setup name="SettingButton">
  import SettingDrawer from './SettingDrawer';
  import { Icon } from '@jeesite/core/components/Icon';

  import { useDrawer } from '@jeesite/core/components/Drawer';

  const [register, { openDrawer }] = useDrawer();
</script>
