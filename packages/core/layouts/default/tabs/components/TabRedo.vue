<template>
  <span class="jeesite-multiple-tabs-content__extra-redo" @click="handleRedo">
    <Icon icon="i-ant-design:redo-outlined" :spin="loading" />
  </span>
</template>
<script lang="ts" setup name="TabRedo">
  import { ref } from 'vue';
  import { useTabs } from '@jeesite/core/hooks/web/useTabs';
  import { Icon } from '@jeesite/core/components/Icon';

  const loading = ref(false);

  const { refreshPage } = useTabs();

  async function handleRedo() {
    loading.value = true;
    await refreshPage();
    setTimeout(() => {
      loading.value = false;
      // Animation execution time
    }, 1200);
  }
</script>
