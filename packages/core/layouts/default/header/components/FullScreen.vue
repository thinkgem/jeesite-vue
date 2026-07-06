<template>
  <Tooltip :title="getTitle" placement="bottom" :mouseEnterDelay="0.5">
    <span @click="toggle">
      <FullscreenOutlined v-if="!isFullscreen" />
      <FullscreenExitOutlined v-else />
    </span>
  </Tooltip>
</template>
<script lang="ts" setup name="FullScreen">
  import { computed, unref } from 'vue';
  import { Tooltip } from 'antdv-next';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useFullscreen } from '@vueuse/core';

  import { FullscreenExitOutlined, FullscreenOutlined } from '@antdv-next/icons';

  const { t } = useI18n();
  const { toggle, isFullscreen } = useFullscreen();

  const getTitle = computed(() => {
    return unref(isFullscreen) ? t('layout.header.tooltipExitFull') : t('layout.header.tooltipEntryFull');
  });
</script>
