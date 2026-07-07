<template>
  <BasicButton v-if="!props.enable" v-bind="btnBind">
    <template v-for="(_, name) in $slots" :key="name" #[name]="scopeData">
      <slot :name="name" v-bind="scopeData || {}"></slot>
    </template>
  </BasicButton>
  <Popconfirm v-else v-bind="bindValues">
    <template #default>
      <BasicButton v-bind="btnBind">
        <template v-for="(_, name) in $slots" :key="name" #[name]="scopeData">
          <slot :name="name" v-bind="scopeData || {}"></slot>
        </template>
      </BasicButton>
    </template>
  </Popconfirm>
</template>
<script lang="ts" setup name="PopConfirmButton">
  import { computed, unref } from 'vue';
  import BasicButton from './BasicButton.vue';
  import { Popconfirm } from 'antdv-next';
  import { omit } from 'lodash-es';
  import { useAttrs } from '@jeesite/core/hooks/core/useAttrs';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { popConfirmButtonProps } from './props';

  defineOptions({
    inheritAttrs: false,
  });

  const props = defineProps(popConfirmButtonProps);

  const { t } = useI18n();
  const attrs = useAttrs();

  // get inherit binding value
  const getBindValues = computed(() => {
    return Object.assign(
      {
        okText: t('common.okText'),
        cancelText: t('common.cancelText'),
        placement: 'left',
      },
      { ...props, ...unref(attrs) },
    );
  });

  const bindValues = computed(() => {
    return omit(unref(getBindValues), 'icon') as Recordable;
  });

  const btnBind = computed(() => {
    const bind = omit(unref(bindValues), 'title') as Recordable;
    if (bind.disabled) bind.color = '';
    return bind;
  });
</script>
