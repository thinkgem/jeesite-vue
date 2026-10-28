/**
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author Vben、ThinkGem
 */
import type { BasicTableProps, FetchParams, SorterResult } from '../types/table';
import type { PaginationProps } from '../types/pagination';
import type { FormRecordable, TableRecordable } from '@jeesite/types/record';

import { ref, unref, ComputedRef, computed, onMounted, watch, reactive, Ref, watchEffect } from 'vue';
import { useTimeoutFn } from '@jeesite/core/hooks/core/useTimeout';
import { buildUUID } from '@jeesite/core/utils/uuid';
import { isFunction, isBoolean, isArray } from '@jeesite/core/utils/is';
import { get, cloneDeep, merge } from 'lodash-es';
import { FETCH_SETTING, ROW_KEY, PAGE_SIZE } from '../const';
import { useEmitter } from '@jeesite/core/store/modules/user';
import { useDict } from '@jeesite/core/components/Dict';

interface ActionType {
  getPaginationInfo: ComputedRef<boolean | PaginationProps>;
  setPagination: (info: Partial<PaginationProps>) => void;
  setLoading: (loading: boolean) => void;
  getFieldsValue: () => FormRecordable;
  clearSelectedRowKeys: () => void;
  tableData: Ref<TableRecordable[]>;
  collapseAll: () => void;
  expandCollapse: (record: TableRecordable, onlyLoadData: boolean, forceLoad: boolean) => Promise<any>;
}

interface SearchState {
  sortInfo: Recordable;
  filterInfo: Record<string, string[]>;
}
export function useDataSource(
  propsRef: ComputedRef<BasicTableProps>,
  dictTypesRef: Ref<Set<string>>,
  {
    getPaginationInfo,
    setPagination,
    setLoading,
    getFieldsValue,
    clearSelectedRowKeys,
    tableData,
    collapseAll,
    expandCollapse,
  }: ActionType,
  emit: EmitType,
) {
  const emitter = useEmitter();
  const searchState = reactive<SearchState>({
    sortInfo: {},
    filterInfo: {},
  });
  const dataSourceRef: Ref<TableRecordable[]> = ref([]);
  const delDataSourceRef: Ref<TableRecordable[]> = ref([]);
  const rawDataSourceRef: Ref<TableRecordable> = ref({});
  const getDataSourceRef: Ref<TableRecordable[]> = ref([]);
  const { initDict } = useDict();

  watchEffect(() => {
    tableData.value = unref(dataSourceRef);
  });

  watch(
    () => unref(propsRef).dataSource,
    () => {
      const { dataSource, api } = unref(propsRef);
      !api && dataSource && (dataSourceRef.value = dataSource);
    },
    {
      immediate: true,
    },
  );

  async function handleTableChange(
    pagination: PaginationProps,
    filters: Partial<Recordable<string[]>>,
    sorter: SorterResult,
  ) {
    const { clearSelectedOnReload, sortFn, filterFn } = unref(propsRef);
    if (clearSelectedOnReload) {
      clearSelectedRowKeys();
    }
    setPagination(pagination);

    const params: Recordable = {};
    if (sorter && isFunction(sortFn)) {
      const sortInfo = sortFn(sorter);
      searchState.sortInfo = sortInfo;
      params.sortInfo = sortInfo;
    }

    if (filters && isFunction(filterFn)) {
      const filterInfo = filterFn(filters);
      searchState.filterInfo = filterInfo;
      params.filterInfo = filterInfo;
    }
    await fetch(params);
  }

  function setTableKey(items: any[]) {
    if (!items || !Array.isArray(items)) return;
    items.forEach((item) => {
      if (!item[ROW_KEY]) {
        item[ROW_KEY] = buildUUID();
      }
      if (item.children && item.children.length) {
        setTableKey(item.children);
      }
    });
  }

  const getAutoCreateKey = computed(() => {
    return unref(propsRef).autoCreateKey && !unref(propsRef).rowKey;
  });

  const getRowKey = computed(() => {
    const { rowKey } = unref(propsRef);
    return unref(getAutoCreateKey) ? ROW_KEY : rowKey;
  });

  watch(
    () => dataSourceRef.value,
    async (value, oldValue) => {
      if (value === oldValue) return;
      const dataSource = unref(dataSourceRef);
      if (!dataSource || dataSource.length === 0) {
        getDataSourceRef.value = unref(dataSourceRef);
        return;
      }
      if (unref(getAutoCreateKey)) {
        const firstItem = dataSource[0];
        const lastItem = dataSource[dataSource.length - 1];
        if (firstItem && lastItem) {
          if (!firstItem[ROW_KEY] || !lastItem[ROW_KEY]) {
            const data = cloneDeep(unref(dataSourceRef));
            data.forEach((item) => {
              if (!item[ROW_KEY]) {
                item[ROW_KEY] = buildUUID();
              }
              if (item.children && item.children.length) {
                setTableKey(item.children);
              }
            });
            dataSourceRef.value = data;
          }
        }
      }
      await initDict(dictTypesRef.value);
      //console.log('datasource', dictTypesRef.value);
      getDataSourceRef.value = unref(dataSourceRef);
    },
    {
      deep: true,
      immediate: true,
    },
  );

  async function updateTableData(index: number, key: string, value: any) {
    const record = dataSourceRef.value[index];
    if (record) {
      dataSourceRef.value[index][key] = value;
    }
    return dataSourceRef.value[index];
  }

  function updateTableDataRecord(rowKey: string | number, record: Recordable): Recordable | undefined {
    const row = findTableDataRecord(rowKey);
    if (row) {
      for (const field in record) {
        row[field] = record[field];
      }
      return row;
    }
  }

  function deleteTableDataRecord(record: Recordable | Recordable[]): Recordable | undefined {
    if (!dataSourceRef.value || dataSourceRef.value.length == 0) return;

    function deleteRecord(dataSource: Recordable[]) {
      const rowKeyName = unref(getRowKey);
      if (!rowKeyName) return;

      const records = !Array.isArray(record) ? [record] : record;
      const recordIndex = records
        .map((item) => {
          if (typeof rowKeyName === 'function') {
            return dataSource.findIndex((s) => {
              const source = rowKeyName(s, undefined) as string;
              const target = rowKeyName(item, undefined) as string;
              return source === target;
            });
          } else {
            return dataSource.findIndex((s) => s[rowKeyName] === item[rowKeyName]);
          }
        }) // 取序号
        .filter((item) => item !== undefined)
        .sort((a, b) => b - a); // 从大到小排序

      for (const index of recordIndex) {
        if (index == -1) continue;
        unref(delDataSourceRef).push(dataSource[index]);
        dataSource.splice(index, 1);
      }

      if (unref(propsRef).isTreeTable) {
        const childrenName = unref(propsRef).childrenColumnName || 'children';
        dataSource.forEach((child) => {
          console.log(child, child[childrenName], childrenName);
          if (child[childrenName] && isArray(child[childrenName])) {
            deleteRecord(child[childrenName]);
          }
        });
      }
    }
    deleteRecord(unref(dataSourceRef));

    setPagination({ total: unref(dataSourceRef).length });
    return unref(dataSourceRef);
  }

  function insertTableDataRecord(record: Recordable, index?: number): Recordable | undefined {
    // if (!dataSourceRef.value || dataSourceRef.value.length == 0) return;
    index = index ?? dataSourceRef.value?.length;
    unref(dataSourceRef).splice(index, 0, record);
    return unref(dataSourceRef);
  }

  function findTableDataRecord(rowKey: string | number) {
    if (!dataSourceRef.value || dataSourceRef.value.length == 0) return;

    const rowKeyName = unref(getRowKey);
    if (!rowKeyName) return;

    const { childrenColumnName = 'children' } = unref(propsRef);

    const findRow = (array: any[]) => {
      let ret;
      array.some(function iter(r) {
        if (typeof rowKeyName === 'function') {
          if ((rowKeyName(r, undefined) as string) === rowKey) {
            ret = r;
            return true;
          }
        } else {
          if (Reflect.has(r, rowKeyName) && r[rowKeyName] === rowKey) {
            ret = r;
            return true;
          }
        }
        return r[childrenColumnName] && r[childrenColumnName].some(iter);
      });
      return ret;
    };

    // const row = dataSourceRef.value.find(r => {
    //   if (typeof rowKeyName === 'function') {
    //     return (rowKeyName(r) as string) === rowKey
    //   } else {
    //     return Reflect.has(r, rowKeyName) && r[rowKeyName] === rowKey
    //   }
    // })
    return findRow(dataSourceRef.value);
  }

  async function fetch(opt?: FetchParams): Promise<any> {
    const { api, searchInfo, defSort, fetchSetting, beforeFetch, afterFetch, useSearchForm, pagination, isTreeTable } =
      unref(propsRef);

    if (!api || !isFunction(api)) return;
    try {
      setLoading(true);
      const { pageField, sizeField, listField, totalField } = Object.assign({}, FETCH_SETTING, fetchSetting);
      let pageParams: Recordable = {};

      const { current = 1, pageSize: pageSizeVal, defaultPageSize } = unref(getPaginationInfo) as PaginationProps;
      const pageSize = pageSizeVal || defaultPageSize || PAGE_SIZE;

      if ((isBoolean(pagination) && !pagination) || isBoolean(getPaginationInfo)) {
        pageParams = {};
      } else {
        pageParams[pageField] = (opt && opt.page) || current;
        pageParams[sizeField] = pageSize;
      }

      const { sortInfo = {}, filterInfo } = searchState;

      let params: Recordable = merge(
        pageParams,
        useSearchForm ? getFieldsValue() : {},
        searchInfo,
        opt?.searchInfo ?? {},
        defSort,
        sortInfo,
        filterInfo,
        opt?.sortInfo ?? {},
        opt?.filterInfo ?? {},
      );

      collapseAll(); // 如果是树表，刷新后折叠

      if (beforeFetch && isFunction(beforeFetch)) {
        params = (await beforeFetch(params)) || params;
      }

      const res = await api(params);
      rawDataSourceRef.value = res;

      const isArrayResult = Array.isArray(res);

      let resultItems: Recordable[] = isArrayResult ? res : get(res, listField);
      const resultTotal: number = isArrayResult ? res.length : get(res, totalField);

      // 假如数据变少，导致总页数变少并小于当前选中页码，通过getPaginationRef获取到的页码是不正确的，需获取正确的页码再次执行
      if (resultTotal) {
        const currentTotalPage = Math.ceil(resultTotal / pageSize);
        if (current > currentTotalPage) {
          setPagination({
            current: currentTotalPage,
          });
          return await fetch(opt);
        }
      }

      if (isTreeTable && resultItems.length > 0) {
        const { childrenColumnName = 'children' } = unref(propsRef);
        if (!resultItems[0][childrenColumnName]) {
          resultItems[0][childrenColumnName] = [];
        }
      }

      if (afterFetch && isFunction(afterFetch)) {
        resultItems = (await afterFetch(resultItems)) || resultItems;
      }
      dataSourceRef.value = resultItems;
      setPagination({
        total: resultTotal || 0,
      });
      if (opt && opt.page) {
        setPagination({
          current: opt.page || 1,
        });
      }
      emit('fetch-success', {
        items: unref(resultItems),
        total: resultTotal,
        params,
      });
      emitter.emit('on-page-wrapper-resize');
      return resultItems;
    } catch (error) {
      emit('fetch-error', error);
      dataSourceRef.value = [];
      setPagination({
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  function setTableData<T = Recordable[]>(values: T[]) {
    dataSourceRef.value = values as Recordable[];
    delDataSourceRef.value = [];
  }

  function getDataSource<T = Recordable>() {
    return getDataSourceRef.value as T[];
  }

  function getDelDataSource<T = Recordable>() {
    return delDataSourceRef.value as T[];
  }

  function getRawDataSource<T = Recordable>() {
    return rawDataSourceRef.value as T;
  }

  /**
   * 重载表格数据
   * <p>
   * 1. 树表：传入行数据（record）时，只刷新该行所在的节点（即其父节点下的子数据），其它节点数据不动；
   *    兼容移动父节点的场景（oldParentCode），原父节点与新父节点都刷新；
   * 2. 非树表、一级数据（父级为空或 0）、父节点不在已加载数据中：刷新当前列表。
   * </p>
   * @param opt 刷新参数（record：当前行数据；parentCode：兼容旧版调用）
   */
  async function reload(opt?: FetchParams) {
    const { clearSelectedOnReload } = unref(propsRef);
    if (clearSelectedOnReload) {
      clearSelectedRowKeys();
    }
    // 树表：只刷新当前行所在的节点（父节点），其它节点数据不动
    if (unref(propsRef).isTreeTable && (await refreshParentNodes(opt))) {
      return;
    }
    // 重载表格数据（非树表、一级数据、父节点未加载时刷新当前列表）
    await fetch(opt);
  }

  /**
   * 树表：刷新行数据所在的父节点（移动节点时含原父节点），返回是否已刷新
   * <p>
   * 父节点不在已加载数据中（如列表只显示某个树节点的子数据）时返回 false，
   * 由调用方退回刷新当前列表，避免出现「只刷新当前节点」却什么都没刷新的情况。
   * </p>
   */
  async function refreshParentNodes(opt?: FetchParams) {
    const codes = [opt?.record?.oldParentCode, opt?.record?.parentCode, opt?.parentCode]
      .filter((code) => code != null && code != '' && code != '0')
      .map((code) => String(code));
    let refreshed = false;
    for (const code of Array.from(new Set(codes))) {
      const row = findTableDataRecord(code);
      if (!row) {
        continue;
      }
      // 强制重新加载该节点下的子数据，并保持该节点展开
      await expandCollapse(row, false, true);
      refreshed = true;
    }
    return refreshed;
  }

  onMounted(() => {
    useTimeoutFn(() => {
      unref(propsRef).immediate && fetch();
    }, 16);
  });

  return {
    getDataSourceRef,
    getDataSource,
    getDelDataSource,
    getRawDataSource,
    getRowKey,
    getAutoCreateKey,
    setTableData,
    updateTableData,
    updateTableDataRecord,
    deleteTableDataRecord,
    insertTableDataRecord,
    findTableDataRecord,
    handleTableChange,
    fetch,
    reload,
  };
}
