<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @description 列表选择框、表格选择框
 * @author ThinkGem
-->
<template>
  <div class="jeesite-listselect">
    <SpaceCompact
      v-if="checkbox"
      block
      class="jeesite-listselect-control jeesite-listselect-multiple"
      :size="controlSize"
    >
      <Select
        v-bind="getMultipleAttrs"
        :value="selectedValues"
        :options="selectedOptions"
        :mode="allowInput ? 'tags' : 'multiple'"
        :open="false"
        :showSearch="allowInput && !readonly"
        :suffixIcon="null"
        :tokenSeparators="allowInput ? [','] : undefined"
        @change="handleMultipleChange"
        @click="handleInputClick"
      />
      <Button
        class="jeesite-listselect-search"
        :disabled="readonly"
        htmlType="button"
        title="打开列表选择"
        @click="handleInputSelect"
      >
        <template #icon>
          <SearchOutlined />
        </template>
      </Button>
    </SpaceCompact>
    <SpaceCompact v-else block class="jeesite-listselect-control" :size="controlSize">
      <Input v-bind="getAttrs" v-model:value="labelValueRef" @click="handleInputClick" @input="handleInput" />
      <Button
        class="jeesite-listselect-search"
        :disabled="readonly"
        htmlType="button"
        title="打开列表选择"
        @click="handleInputSelect"
      >
        <template #icon>
          <SearchOutlined />
        </template>
      </Button>
    </SpaceCompact>
    <component
      :is="modalComponent"
      :config="configRef"
      :checkbox="checkbox"
      @register="registerModal"
      @select="handleSelect"
    />
  </div>
</template>
<script lang="ts" setup name="JeeSiteListSelect">
  import { ref, unref, computed, watch, onMounted, shallowRef, type PropType } from 'vue';
  import { Button, Input, Select, SpaceCompact } from 'antdv-next';
  import { SearchOutlined } from '@antdv-next/icons';
  import { propTypes } from '@jeesite/core/utils/propTypes';
  import { useAttrs } from '@jeesite/core/hooks/core/useAttrs';
  import { retranslateConfig } from '@jeesite/core/hooks/web/useI18n';

  import { useModal } from '@jeesite/core/components/Modal';
  import { createAsyncComponent } from '@jeesite/core/utils/factory/createAsyncComponent';
  import type { FormActionType, FormSchema } from '@jeesite/core/components/Form';
  import type { FormRecordable } from '@jeesite/types';

  const props = defineProps({
    value: propTypes.string,
    labelValue: propTypes.string,
    selectList: propTypes.array,

    // 选择类型，加载 ./selectType/*.ts 的配置。
    selectType: propTypes.string.def('userSelect'),

    // 配置文件，是 selectType 更自由的设置，不限定路径
    configFile: propTypes.any, // 例如：import('./select'),

    // 配置文件，是 selectType 更自由的设置，不限定路径
    config: propTypes.any, // 例如：import Select form './select';

    // 请求参数（列表查询默认值）
    queryParams: propTypes.object.def({}),

    // 选择结果或回显数据中的编码和名称属性名（默认使用 selectType 里指定的）
    itemCode: propTypes.string,
    itemName: propTypes.string,

    checkbox: propTypes.bool, // 是否多选
    allowInput: propTypes.bool, // 允许输入
    readonly: propTypes.bool, // 是否只读
    openCheck: propTypes.bool.def(true), // 打开校验

    // 当前表单字段配置
    formSchema: {
      type: Object as PropType<FormSchema<FormRecordable>>,
    },
    // 当前表单对象操作
    formActionType: {
      type: Object as PropType<Partial<FormActionType>>,
    },
  });

  const emit = defineEmits(['change', 'update:value', 'update:labelValue', 'select', 'click']);

  const attrs = useAttrs();
  // 动态表单绑定 labelValue 时初始值可能为 undefined，需结合 labelInValue 判断是否启用标签字段。
  const hasLabelValue = computed(() => props.labelValue !== undefined || unref(attrs).labelInValue === true);
  const valueRef = ref<string>(props.value);
  const labelValueRef = ref<string>(hasLabelValue.value ? props.labelValue : props.value);
  const selectListRef = ref<any[]>(props.selectList);
  const itemCode = ref<string>(props.itemCode);
  const itemName = ref<string>(props.itemName);
  const configRef = ref<any>();
  const modalComponent = shallowRef<Nullable<any>>(null);

  interface SelectedOption {
    label: string;
    value: string;
  }

  interface SelectLabelValue {
    label?: unknown;
    value?: string | number;
  }

  type MultipleSelectValue = string | number | SelectLabelValue;

  const [registerModal, { openModal }] = useModal();

  const getAttrs = computed(() => {
    return {
      ...unref(attrs),
      ...(props as Recordable),
      readonly: !props.allowInput || props.readonly,
    };
  });

  const controlSize = computed(() => unref(attrs).size);

  // 多选控件仅透传外部属性，避免将 ListSelect 的业务参数传给底层 Select。
  const getMultipleAttrs = computed(() => {
    const selectAttrs = { ...unref(attrs) };
    // ListSelect 自行维护 labelValue；底层启用 labelInValue 会将字符串变成对象。
    delete selectAttrs.labelInValue;
    return {
      ...selectAttrs,
      disabled: Boolean(unref(attrs).disabled || props.readonly),
    };
  });

  // 将原有逗号分隔协议映射为 Select 所需的值与标签。
  const selectedOptions = computed<SelectedOption[]>(() => {
    const codes = splitValues(valueRef.value);
    const labels = hasLabelValue.value ? splitValues(labelValueRef.value) : codes;
    return codes.map((code, index) => ({
      value: code,
      label: labels[index] ?? code,
    }));
  });

  const selectedValues = computed(() => selectedOptions.value.map((item) => item.value));

  watch(
    () => props.value,
    () => {
      valueRef.value = props.value;
      if (!hasLabelValue.value) {
        labelValueRef.value = props.value;
      }
    },
  );

  watch(
    () => props.labelValue,
    () => {
      labelValueRef.value = hasLabelValue.value ? props.labelValue : props.value;
    },
  );

  watch(
    () => props.selectList,
    () => {
      setSelectList(props.selectList);
    },
    { deep: true },
  );

  function setSelectList(selectList: any[]) {
    selectListRef.value = selectList;
    const codes: string[] = [];
    const names: string[] = [];
    selectList &&
      selectList.forEach((e: Recordable) => {
        codes.push(e[itemCode.value]);
        names.push(e[itemName.value]);
      });
    valueRef.value = codes.join(',');
    labelValueRef.value = hasLabelValue.value ? names.join(',') : valueRef.value;
  }

  onMounted(async () => {
    let configModule: any;
    if (props.config) {
      configModule = props.config;
    } else if (props.configFile) {
      configModule = (await props.configFile).default as any;
    } else {
      configModule = (await import(`./selectType/${props.selectType}.ts`)).default as any;
    }
    const resolved = typeof configModule === 'function' ? configModule() : configModule;
    configRef.value = retranslateConfig(resolved);
    modalComponent.value = createAsyncComponent(() => import('./ListSelectModal.vue'));
    if (!itemCode.value) {
      itemCode.value = configRef.value.itemCode;
    }
    if (!itemName.value) {
      itemName.value = configRef.value.itemName;
    }
  });

  function openSelectModal() {
    if (!props.openCheck) {
      return;
    }
    let selectList: Recordable[];
    if (selectListRef.value) {
      selectList = selectListRef.value;
    } else {
      selectList = getSelectList();
    }
    openModal(true, { selectList, queryParams: props.queryParams });
  }

  function handleInputClick(event?: MouseEvent) {
    const target = event?.target as Element | null;
    if (target?.closest('.ant-select-selection-item-remove, .ant-select-clear')) {
      return;
    }
    if (!props.readonly && !props.allowInput) {
      openSelectModal();
    }
    emit('click');
    // 消除点击输入框后，出现的表单验证信息
    setTimeout(async () => {
      if (props.formSchema && props.formActionType && props.formActionType.clearValidate) {
        await props.formActionType.clearValidate([props.formSchema.field, props.formSchema.fieldLabel as string]);
      }
    }, 500);
  }

  async function handleInputSelect() {
    if (!props.readonly) {
      openSelectModal();
    }
    emit('click');
  }

  function keysToJsonPart(key: string, value: string) {
    const num = key.split('.').length - 1;
    let part = key.replace(/\./g, '":{"');
    if (num >= 0) {
      part = '"' + part + '":"' + value + '"';
    }
    for (var i = 0; i < num; i++) {
      part = part + '}';
    }
    return part as string;
  }

  function getSelectList() {
    var selectList: Recordable[] = [];
    const codes = valueRef.value;
    const names = labelValueRef.value;
    if (codes != null && codes != '' && names != null && names != '') {
      const codesArr = codes.split(',') as string[];
      const namesArr = names.split(',') as string[];
      if (codesArr && namesArr && codesArr.length == namesArr.length) {
        for (var i = 0; i < codesArr.length; i++) {
          const json =
            '{' + keysToJsonPart(itemCode.value, codesArr[i]) + ',' + keysToJsonPart(itemName.value, namesArr[i]) + '}';
          selectList.push(JSON.parse(json));
        }
      }
    }
    return selectList;
  }

  /** 将逗号分隔字段转换为多选值数组。 */
  function splitValues(value?: string) {
    return value ? value.split(',') : [];
  }

  /** 删除标签或录入自定义标签后，同步原有值、标签和已选对象协议。 */
  function handleMultipleChange(values: MultipleSelectValue[]) {
    const codes = values.map(getMultipleValue).filter(Boolean);
    const optionMap = new Map(selectedOptions.value.map((item) => [item.value, item.label]));
    const names = codes.map((code) => optionMap.get(code) || code);
    const currentList = selectListRef.value?.length ? selectListRef.value : getSelectList();
    const nextList = codes.map((code, index) => {
      const currentItem = currentList.find((item) => String(item[itemCode.value]) === code);
      if (currentItem) return currentItem;
      return createSelectItem(code, names[index]);
    });

    valueRef.value = codes.join(',');
    //labelValueRef.value = hasLabelValue.value ? names.join(',') : valueRef.value;
    labelValueRef.value = names.join(',');
    selectListRef.value = nextList;
    emit('update:value', valueRef.value);
    emit('update:labelValue', labelValueRef.value);
    emit('change', valueRef.value, labelValueRef.value);
    emit('select', nextList);
  }

  /** 兼容底层 labelInValue 模式曾产生的对象值，始终提取原始编码。 */
  function getMultipleValue(value: MultipleSelectValue) {
    if (typeof value === 'object' && value !== null) {
      return value.value === undefined || value.value === null ? '' : String(value.value);
    }
    return String(value);
  }

  /** 按当前配置的编码、名称路径创建一个选择项。 */
  function createSelectItem(code: string, name: string) {
    const item: Recordable = {};
    setNestedValue(item, itemCode.value, code);
    setNestedValue(item, itemName.value, name);
    return item;
  }

  /** 为支持嵌套字段名，将值写入对象指定路径。 */
  function setNestedValue(target: Recordable, path: string, value: string) {
    const keys = path.split('.');
    let current = target;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        current[key] ||= {};
        current = current[key];
      }
    });
  }

  function handleSelect(values: Recordable[]) {
    selectListRef.value = Array.from(values);
    valueRef.value = selectListRef.value.map((item) => item[configRef.value.itemCode]).join(',');
    //labelValueRef.value = hasLabelValue.value
    //  ? selectListRef.value.map((item) => item[configRef.value.itemName]).join(',')
    //  : valueRef.value;
    labelValueRef.value = selectListRef.value.map((item) => item[configRef.value.itemName]).join(',');
    emit('update:value', valueRef.value);
    emit('update:labelValue', labelValueRef.value);
    emit('change', valueRef.value, labelValueRef.value);
    emit('select', values);
  }

  function handleInput(event: any) {
    valueRef.value = labelValueRef.value = event.target?.value;
    emit('update:value', valueRef.value);
    emit('update:labelValue', labelValueRef.value);
    emit('change', valueRef.value, labelValueRef.value);
  }

  defineExpose({
    openSelectModal,
    setSelectList,
  });
</script>
<style lang="less">
  .jeesite-listselect {
    &-control {
      width: 100%;

      > .ant-input,
      > .ant-input-affix-wrapper,
      > .ant-select {
        min-width: 0;
        flex: 1;
        width: 100%;
      }
    }

    &-search.ant-btn {
      flex: 0 0 auto;
    }

    &-multiple > &-search.ant-btn {
      height: auto;
    }

    .ant-input-group {
      .ant-input {
        height: 32px;
      }
    }
  }
</style>
