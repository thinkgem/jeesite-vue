/**
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @description 超强兼容表单字段各种数据类型的支持
 * @author Vben、ThinkGem
 */
import type { UnwrapRef, Ref } from 'vue';
import { reactive, readonly, computed, getCurrentInstance, watchEffect, unref, toRaw } from 'vue';

import { isEqual } from 'lodash-es';
import { isEmpty, isNumber, isObject } from '@jeesite/core/utils/is';

export function useRuleFormItem<T extends Recordable>(
  props: T,
  valueField = 'value',
  labelField = 'labelValue',
  changeEvent = 'change',
  emitData?: Ref<any[]>,
) {
  const instance = getCurrentInstance();
  const emit = instance?.emit;
  const compName = instance?.type?.name || 'unknown';
  const emitsOptions = instance?.['emitsOptions'] || {};
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasUpdateValueEmit = hasOwnProperty.call(emitsOptions, 'update:' + valueField);
  const hasUpdateLabelValueEmit = hasOwnProperty.call(emitsOptions, 'update:' + labelField);
  const hasChangeEmit = hasOwnProperty.call(emitsOptions, changeEvent);

  const isMultiple = computed(() => {
    if (compName === 'JeeSiteCheckboxGroup') {
      return true;
    }
    if (
      (compName === 'JeeSiteSelect' || compName === 'JeeSiteTreeSelect') &&
      (props.mode === 'multiple' || props.mode === 'tags' || props.treeCheckable === true)
    ) {
      return true;
    }
    return false;
  });

  const isDictType = computed(() => !isEmpty(props.dictType));

  // 如果未显式设置 labelInValue，则根据是否传递 labelValue 自动判断：
  // 传递了 labelValue 时默认为 true，否则为 false
  // 通过 vnode.props 检测 key 是否存在，以区分"未传递"和"传递了但值为 undefined"
  const labelInValue = computed(() => {
    const vnodeProps = instance?.vnode?.props;
    if (vnodeProps && 'labelInValue' in vnodeProps) return props.labelInValue;
    // if (props.allowInput && props.treeCheckable) return true;
    return !!vnodeProps && labelField in vnodeProps;
  });

  const innerState = reactive({
    value: props[valueField],
  });

  const defaultState = readonly(innerState);

  const setState = (val: UnwrapRef<T[keyof T]>): void => {
    innerState.value = val as T[keyof T];
  };

  watchEffect(() => {
    innerState.value = props[valueField];
  });

  const state: any = computed({
    get() {
      let value = toRaw(innerState.value) as any;
      if (!value) return undefined;
      if (labelInValue.value) {
        const values: Recordable[] = [];
        if (isMultiple.value && !(value instanceof Object) && !(value instanceof Array)) {
          const vals = (value as string)?.split(',');
          const labs = (props[labelField] as string)?.split(',');
          for (let i = 0; i < vals.length; i++) {
            values.push({ value: vals[i], label: labs?.[i] });
          }
          value = values as T[keyof T];
        } else if (!isObject(value) && !(value instanceof Object) && !(value instanceof Array)) {
          value = { value: String(value), label: props[labelField] };
        } else if (value instanceof Array) {
          for (let i = 0; i < value.length; i++) {
            if (isObject(value[i])) break;
            values.push({ value: value[i] });
          }
          if (values.length > 0) {
            value = values as T[keyof T];
          }
        }
      } else if (isMultiple.value && !(value instanceof Object) && !(value instanceof Array)) {
        value = (value as string).split(',');
      } else if (isDictType.value && isNumber(value)) {
        value = String(value);
      }
      // console.log('innerState', value);
      innerState.value = value as T[keyof T];
      return innerState.value;
    },
    set(value: any) {
      if (isEqual(value, defaultState.value)) return;
      innerState.value = value as T[keyof T];
      // nextTick(() => {
      const extData = toRaw(unref(emitData)) || [];
      if (!value) {
        hasUpdateValueEmit && emit?.('update:' + valueField, undefined);
        hasUpdateLabelValueEmit && emit?.('update:' + labelField, undefined);
        hasChangeEmit && emit?.(changeEvent, undefined, undefined, ...extData);
        return;
      }
      // console.log('values', value);
      const values = value instanceof Array ? value : [value];
      if (labelInValue.value) {
        const vals: Recordable[] = [];
        const labs: Recordable[] = [];
        for (let i = 0; i < values.length; i++) {
          vals.push(values[i].value);
          labs.push(values[i].label);
        }
        const value = vals.length > 0 ? vals.join(',') : undefined;
        const labelValue = labs.length > 0 ? labs.join(',') : undefined;
        hasUpdateValueEmit && emit?.('update:' + valueField, value);
        hasUpdateLabelValueEmit && emit?.('update:' + labelField, labelValue);
        hasChangeEmit && emit?.(changeEvent, value, labelValue, ...extData);
      } else {
        const value = values.length > 0 ? values.join(',') : undefined;
        hasUpdateValueEmit && emit?.('update:' + valueField, value);
        hasUpdateLabelValueEmit && emit?.('update:' + labelField, undefined);
        hasChangeEmit && emit?.(changeEvent, value, undefined, ...extData);
      }
      // }).then();
    },
  });

  return { state, setState, defaultState, labelInValue };
}
