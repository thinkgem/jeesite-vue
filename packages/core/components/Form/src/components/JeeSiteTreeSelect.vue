<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @description 支持字典类型、支持下拉框标签返回、支持 API 接口
 * @author Vben、ThinkGem
-->
<template>
  <div class="jeesite-tree-select" @focusout.capture="handleFocusout">
    <TreeSelect
      v-bind="getAttrs"
      v-model:value="state"
      :treeData="treeDataRef"
      @blur="handleBlur"
      @change="handleTreeChange"
      @click="handleFetch"
      @input-key-down="handleInputKeyDown"
      @search="handleSearch"
    >
      <template #[item]="data" v-for="item in Object.keys($slots)">
        <slot :name="item" v-bind="data || {}"></slot>
      </template>
      <template #notFoundContent v-if="loading">
        <span>
          <LoadingOutlined spin class="mr-1" />
          {{ t('component.form.apiSelectNotFound') }}
        </span>
      </template>
    </TreeSelect>
  </div>
</template>
<script lang="ts" setup name="JeeSiteTreeSelect">
  import { ref, unref, computed, watch, onMounted, shallowRef } from 'vue';
  import { TreeSelect } from 'antdv-next';
  import { isEmpty, isFunction } from '@jeesite/core/utils/is';
  import { propTypes } from '@jeesite/core/utils/propTypes';
  import { listToTree } from '@jeesite/core/utils/helper/treeHelper';
  import { useAttrs } from '@jeesite/core/hooks/core/useAttrs';
  import { useRuleFormItem } from '@jeesite/core/hooks/component/useFormItem';
  import { get, omit } from 'lodash-es';
  import { LoadingOutlined } from '@antdv-next/icons';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useDict } from '@jeesite/core/components/Dict';
  import { TreeItem } from '@jeesite/core/components/Tree';

  const props = defineProps({
    value: {
      type: [Array, Object, String, Number] as PropType<Array<any> | object | string | number>,
    },
    labelValue: {
      type: [Array, Object, String, Number] as PropType<Array<any> | object | string | number>,
    },
    labelInValue: propTypes.bool,
    treeData: {
      type: Object as PropType<Recordable[] | TreeItem[]>,
      default: () => [],
    },
    api: {
      type: Function as PropType<(arg?: Recordable) => Promise<Recordable[] | TreeItem[]>>,
      default: null,
    },
    params: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
    isDisable: {
      type: Function as PropType<(node: Recordable) => boolean>,
      default: null,
    },
    resultField: propTypes.string.def(''),
    immediate: propTypes.bool.def(false),
    dictType: propTypes.string,
    treeCheckable: propTypes.bool,
    treeDataSimpleMode: propTypes.bool.def(true),
    canSelectParent: propTypes.bool.def(true),
    // 是否允许输入树选项之外的值
    allowInput: propTypes.bool.def(false),
    // 是否返回全路径，包含所有上级信息，以 returnFullNameSplit 参数分隔
    returnFullName: propTypes.bool.def(false),
    // 是否返回全路径，的分隔符，默认“/”
    returnFullNameSplit: propTypes.string.def('/'),
  });

  const emit = defineEmits([
    'blur',
    'change',
    'update:value',
    'update:labelValue',
    'options-change',
    'click',
    'search',
  ]);

  const { t } = useI18n();
  const attrs = useAttrs();
  // 未传 labelValue 时使用 value 回显，传入后保持原有标签逻辑。
  const [state] = useRuleFormItem(props, 'value', 'labelValue', 'change', undefined, true);
  const treeDataRef = ref<Recordable[]>(props.treeData);
  const isFirstLoad = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const searchValue = shallowRef('');

  const getAttrs = computed(() => {
    let propsData = {
      virtual: false,
      showSearch: true,
      treeNodeFilterProp: 'name',
      fieldNames: {
        value: props.dictType ? 'value' : 'id',
        label: 'name',
      },
      styles: {
        popup: {
          root: { maxHeight: '300px' },
        },
      },
      classes: {
        popup: {
          root: 'jeesite-tree-select-popup',
        },
      },
      getPopupContainer: () => document.body,
      ...unref(attrs),
      ...props,
    };
    if (props.allowInput) {
      const showSearch = propsData.showSearch;
      propsData.showSearch = {
        ...(typeof showSearch === 'object' && showSearch !== null ? showSearch : {}),
        searchValue: searchValue.value,
        onSearch: handleSearch,
      };
    }
    if (props.returnFullName) {
      propsData.treeNodeLabelProp = '_fullName';
    }
    return omit(propsData, 'treeData', 'params', 'allowInput');
  });

  watch(
    () => props.dictType,
    () => {
      if (!isEmpty(props.dictType)) {
        const { initSelectTreeData } = useDict();
        initSelectTreeData(treeDataRef, props.dictType, true);
      }
    },
    { immediate: true },
  );

  watch(
    () => props.treeData,
    () => {
      treeDataRef.value = getTreeData(props.treeData);
      emit('options-change', unref(treeDataRef));
    },
  );

  watch(
    () => props.params,
    () => {
      isFirstLoad.value && fetch();
    },
    { deep: true },
  );

  watch(
    () => props.immediate,
    (v) => {
      v && !isFirstLoad.value && fetch();
    },
  );

  onMounted(async () => {
    if (props.treeData && props.treeData.length > 0) {
      treeDataRef.value = getTreeData(props.treeData);
    }
    if (props.immediate) {
      await fetch();
      isFirstLoad.value = true;
    }
  });

  async function fetch() {
    const { api } = props;
    if (!api || !isFunction(api)) return;
    treeDataRef.value = [];
    try {
      loading.value = true;
      let res = await api(props.params);
      if (props.resultField) {
        res = get(res, props.resultField) || [];
      }
      if (Array.isArray(res)) {
        treeDataRef.value = getTreeData(res);
      }
      emit('options-change', unref(treeDataRef));
    } catch (error) {
      console.warn(error);
    } finally {
      loading.value = false;
    }
  }

  function getTreeData(treeData: Recordable[]) {
    if (props.treeDataSimpleMode) {
      return listToTree(treeData, {
        callback: (parent, node) => {
          if (props.isDisable && node) {
            node.disabled = props.isDisable(node);
          }
          if (!props.canSelectParent && parent) {
            if (parent.children && parent.children.length > 0) {
              parent.disabled = true;
            }
          }
        },
        fullNameSplit: props.returnFullNameSplit,
      });
    }
    return treeData;
  }

  async function handleFetch() {
    if (!props.immediate && !unref(isFirstLoad)) {
      await fetch();
      isFirstLoad.value = true;
    }
    emit('click');
  }

  /** 同步搜索文本，并继续向外触发原有搜索事件。 */
  function handleSearch(value: string) {
    if (props.allowInput) {
      searchValue.value = value;
    }
    emit('search', value);
  }

  /** 选择树节点后清理受控搜索文本，恢复已选值标签。 */
  function handleTreeChange() {
    if (props.allowInput) {
      searchValue.value = '';
    }
  }

  /** 将树选项之外的输入值写入当前单选或多选值。 */
  function commitInputValue(value: string | undefined) {
    const inputValue = value?.trim();
    if (!props.allowInput || !inputValue) return false;

    const currentValue = state.value;
    const selectedValues = Array.isArray(currentValue)
      ? currentValue
      : currentValue === undefined || currentValue === null
        ? []
        : [currentValue];
    const hasValue = selectedValues.some((item) => {
      const value = typeof item === 'object' && item !== null ? item.value : item;
      return String(value) === inputValue;
    });
    const customValue = props.labelInValue ? { value: inputValue, label: inputValue } : inputValue;
    const multiple = props.treeCheckable || Boolean(unref(attrs).multiple);

    if (multiple) {
      if (!hasValue) {
        state.value = [...selectedValues, customValue];
      }
    } else if (!hasValue) {
      state.value = customValue;
    }

    searchValue.value = '';
    return true;
  }

  /** 焦点真正离开组件时，在底层清空搜索文本前确认当前输入。 */
  function handleFocusout(event: FocusEvent) {
    const currentTarget = event.currentTarget as HTMLElement | null;
    const relatedTarget = event.relatedTarget as Element | null;
    if (
      relatedTarget &&
      (currentTarget?.contains(relatedTarget) || relatedTarget.closest('.jeesite-tree-select-popup'))
    ) {
      return;
    }
    const inputValue = (event.target as HTMLInputElement | null)?.value || searchValue.value;
    commitInputValue(inputValue);
  }

  /** 按回车确认当前输入，避免底层同时选中高亮树节点。 */
  function handleInputKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    const inputValue = (event.target as HTMLInputElement | null)?.value || searchValue.value;
    if (commitInputValue(inputValue)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /** 继续向外触发原有失焦事件。 */
  function handleBlur(event: FocusEvent) {
    emit('blur', event);
  }
</script>
<style lang="less">
  @prefix-cls: ~'jeesite-tree-select';

  .@{prefix-cls} {
    width: 100%;

    .ant-select {
      width: 100%;
    }
  }

  .ant-select-dropdown.@{prefix-cls}-popup .ant-select-tree {
    .ant-select-tree-indent-unit {
      width: 18px;
    }

    .ant-select-tree-switcher {
      width: 18px;

      .ant-select-tree-switcher-icon svg {
        margin-top: -3px;
      }
    }
  }
</style>
