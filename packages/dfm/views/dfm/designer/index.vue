<template>
  <PageWrapper :contentFullHeight="true">
    <DfmDesigner ref="designerRef" :formMode="true" @save="handleSave" />
  </PageWrapper>
</template>
<script lang="ts" setup name="ViewsDfmDesignerIndex">
  import { PageWrapper } from '@jeesite/core/components/Page';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { DfmDesigner } from '@jeesite/dfm';

  // import { pluginManager } from '@jeesite/dfm';
  // import { onMounted } from 'vue';
  //
  // onMounted(() => {
  //   console.log(pluginManager.component.getComponents());
  //   console.log(pluginManager.component.getComponentConfigs());
  //   console.log(pluginManager.component.getComponent('input'));
  //   console.log(pluginManager.component.getComponentConfigByType('input'));
  //   pluginManager.component.registerComponent(componentConfig);
  //   pluginManager.component.removeComponent('input');
  // });

  const { showMessage } = useMessage();

  function handleSave(data: string) {
    showMessage('在业务中实现.');
    console.log(data);
  }
</script>
