/**
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author Vben、ThinkGem
 */
import type { ComputedRef, Ref } from 'vue';
import type { BasicTableProps } from '../types/table';
import { computed, unref, ref, toRaw } from 'vue';
import { ROW_KEY } from '../const';
import { isArray, isEmpty, isFunction } from '@jeesite/core/utils/is';

export function useTableExpand(
  propsRef: ComputedRef<BasicTableProps>,
  tableData: Ref<Recordable[]>,
  getFormData: Fn,
  emit: EmitType,
  setLoading: Fn,
) {
  const expandedRowKeys = ref<string[]>([]);
  const currentLevel = ref(0);

  const getChildrenColumnName = computed(() => {
    const { childrenColumnName } = unref(propsRef);
    return childrenColumnName || 'children';
  });

  const getAutoCreateKey = computed(() => {
    return unref(propsRef).autoCreateKey && !unref(propsRef).rowKey;
  });

  const getRowKey = computed(() => {
    const { rowKey } = unref(propsRef);
    return unref(getAutoCreateKey) ? ROW_KEY : rowKey;
  });

  const getExpandOption = computed(() => {
    const { isTreeTable } = unref(propsRef);
    if (!isTreeTable) return {};

    return {
      expandedRowKeys: unref(expandedRowKeys),
      onExpandedRowsChange: (keys: string[]) => {
        expandedRowKeys.value = keys;
        emit('expanded-rows-change', keys);
      },
    };
  });

  function safeGetFormData() {
    try {
      return getFormData();
    } catch (e) {
      return undefined;
    }
  }

  function expandAll() {
    setLoading(true);
    setTimeout(async () => {
      try {
        if (safeGetFormData()) {
          await expandOneLevel();
          currentLevel.value += 1;
        } else {
          const keys = getAllKeys();
          expandedRowKeys.value = keys;
        }
      } finally {
        setLoading(false);
      }
    });
  }

  function expandRows(keys: string[]) {
    // use row ID expands the specified table row
    const { isTreeTable } = unref(propsRef);
    if (!isTreeTable) return;
    // 去重：重复展开同一行时不产生重复的展开键
    expandedRowKeys.value = Array.from(new Set([...expandedRowKeys.value, ...keys]));
  }

  function getAllKeys(data?: Recordable[]) {
    const keys: string[] = [];
    toRaw(data || unref(tableData)).forEach((item) => {
      keys.push(item[unref(getRowKey) as string]);
      const children = item[unref(getChildrenColumnName)];
      if (children?.length) {
        keys.push(...getAllKeys(children));
      }
    });
    return keys;
  }

  async function expandOneLevel(data?: Recordable[], treeLevel = 0) {
    const rowKey = unref(getRowKey) as string;
    for (const record of toRaw(data || tableData.value)) {
      await expandCollapse(record, true);
      expandedRowKeys.value.push(record[rowKey]);
      if (treeLevel < currentLevel.value) {
        const children = record[unref(getChildrenColumnName)];
        if (children?.length > 0) {
          await expandOneLevel(children, treeLevel + 1);
        }
      }
    }
  }

  function collapseAll() {
    expandedRowKeys.value = [];
    currentLevel.value = 0;
  }

  async function expandCollapse(record: Recordable, onlyLoadData = false, forceLoad = false) {
    const treeLeaf = record.treeLeaf && record.treeLeaf === '1';
    if ((!treeLeaf && isEmpty(record[unref(getChildrenColumnName)])) || forceLoad) {
      record.isLoading = true;
      const { api, beforeChildFetch, afterChildFetch } = unref(propsRef);
      if (!api || !isFunction(api)) return;
      const rowKey = unref(getRowKey) as string;
      let params = {
        parentCode: record[rowKey] as string,
        status: forceLoad ? '' : safeGetFormData()?.status,
      };
      if (beforeChildFetch && isFunction(beforeChildFetch)) {
        params = (await beforeChildFetch(params)) || params;
      }
      let list = await api(params);
      // 接口返回 {@code { list: [...] }} 包装时取 list；
      // 树表不分页（pagination = false）时接口仍返回包装结构，不能依赖分页开关判断
      if (list && !isArray(list) && isArray(list.list)) {
        list = list.list;
      }
      if (afterChildFetch && isFunction(afterChildFetch)) {
        list = (await afterChildFetch(list)) || list;
      }
      // 子节点挂到表格配置的子节点字段上（childrenColumnName，默认 childList）
      const childrenColumnName = unref(getChildrenColumnName);
      if (isArray(list) && list.length > 0) {
        record[childrenColumnName] = list;
        record.treeLeaf = '0';
      } else {
        record[childrenColumnName] = [];
        record.treeLeaf = '1';
      }
      record.isLoading = false;
    }
    if (!onlyLoadData) {
      let expanded = true;
      const rowKey = unref(getRowKey) as string;
      for (const index in expandedRowKeys.value) {
        if (record[rowKey] == expandedRowKeys.value[index]) {
          expandedRowKeys.value.splice(index as unknown as number, 1);
          expanded = false;
          break;
        }
      }
      if (forceLoad) {
        expanded = true;
      }
      if (expanded) {
        // 去重：重复刷新同一节点（如停用、启用后刷新当前节点）时不产生重复的展开键
        expandedRowKeys.value = Array.from(new Set([...expandedRowKeys.value, record[unref(getRowKey) as string]]));
      }
      return expanded;
    }
  }

  return { getExpandOption, expandAll, expandRows, collapseAll, expandCollapse };
}
