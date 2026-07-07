<template>
  <span class="jeesite-basic-menu-item-content- flex items-center" :style="`color: ${getColor}`">
    <Icon v-if="getIcon" :icon="getIcon" :size="18" class="jeesite-basic-menu-item-content-wrapper__icon mr-2" />
    {{ getI18nName }}
  </span>
</template>
<script lang="ts" setup name="MenuItemContent">
  import { computed } from 'vue';

  import Icon from '@jeesite/core/components/Icon';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { contentProps } from '../props';

  const props = defineProps(contentProps);
  const { t } = useI18n();

  const getI18nName = computed(() => t(props.item?.name));
  const getIcon = computed(() => props.item?.icon);
  const getColor = computed(() => props.item?.color);
</script>
