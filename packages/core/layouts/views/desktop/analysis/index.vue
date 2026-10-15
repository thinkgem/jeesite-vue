<template>
  <div class="jeesite-analysis m-0">
    <GrowCard class="enter-y" />
    <SiteAnalysis class="enter-y !my-1.5" />
    <div class="enter-y md:flex mb-1.5">
      <VisitRadar class="w-full md:w-1/3" />
      <VisitSource class="w-full !my-1.5 md:w-1/3 !md:mx-1.5 !md:my-0" />
      <SalesProductPie class="w-full md:w-1/3" />
    </div>
  </div>
</template>
<script lang="ts" setup name="Analysis">
  import { createAsyncComponent } from '@jeesite/core/utils/factory/createAsyncComponent';

  const GrowCard = createAsyncComponent(() => import('./components/GrowCard.vue'));
  const SiteAnalysis = createAsyncComponent(() => import('./components/SiteAnalysis.vue'));
  const VisitSource = createAsyncComponent(() => import('./components/VisitSource.vue'));
  const VisitRadar = createAsyncComponent(() => import('./components/VisitRadar.vue'));
  const SalesProductPie = createAsyncComponent(() => import('./components/SalesProductPie.vue'));
</script>
<style class="less">
  .jeesite-analysis {
    .ant-card {
      border-radius: 10px !important;
    }
  }
</style>
