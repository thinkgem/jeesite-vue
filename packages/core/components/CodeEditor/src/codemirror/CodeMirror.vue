<template>
  <div
    class="relative w-full overflow-hidden !h-full"
    :class="{ 'ant-input': props.bordered, 'css-dev-only-do-not-override-kqecok': props.bordered }"
    ref="el"
  ></div>
</template>

<script lang="ts" setup>
  import { type PropType, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
  import { useWindowSizeFn } from '@jeesite/core/hooks/event/useWindowSizeFn';
  import { useDebounceFn } from '@vueuse/core';
  import { useAppStore } from '@jeesite/core/store/modules/app';

  import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
  import { EditorState, Compartment, type Extension } from '@codemirror/state';
  import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
  import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
  import {
    bracketMatching,
    foldGutter,
    foldKeymap,
    codeFolding,
    syntaxHighlighting,
    defaultHighlightStyle,
  } from '@codemirror/language';
  import { lintGutter } from '@codemirror/lint';
  import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
  import { oneDark } from '@codemirror/theme-one-dark';

  import { MODE, parserDynamicImport } from './typing';
  import type { LanguageSupport } from '@codemirror/language';

  const props = defineProps({
    mode: {
      type: String as PropType<MODE>,
      default: MODE.JSON,
      validator(value: any) {
        return Object.values(MODE).includes(value);
      },
    },
    value: { type: String, default: '' },
    readonly: { type: Boolean, default: false },
    bordered: { type: Boolean, default: false },
    config: { type: Object, default: () => ({}) },
  });

  const emit = defineEmits(['change']);

  const el = ref();
  let editorView: EditorView | null = null;

  // 使用 Compartment 实现可动态切换的配置
  const languageCompartment = new Compartment();
  const themeCompartment = new Compartment();
  const editableCompartment = new Compartment();

  const debounceRefresh = useDebounceFn(refresh, 100);
  const appStore = useAppStore();

  // 监听 value 变化，同步到编辑器
  watch(
    () => props.value,
    async (value) => {
      await nextTick();
      if (!editorView) return;
      const oldValue = editorView.state.doc.toString();
      if (value !== oldValue) {
        editorView.dispatch({
          changes: {
            from: 0,
            to: oldValue.length,
            insert: value || '',
          },
        });
      }
    },
    { flush: 'post' },
  );

  // 监听 mode 变化，动态切换语言
  watch(
    () => props.mode,
    async (newMode) => {
      if (!editorView) return;
      await setLanguage(newMode);
    },
  );

  // 监听 readonly 变化
  watch(
    () => props.readonly,
    (newReadonly) => {
      if (!editorView) return;
      editorView.dispatch({
        effects: editableCompartment.reconfigure(EditorView.editable.of(!newReadonly)),
      });
    },
  );

  // 监听暗色模式变化
  watch(
    () => appStore.getDarkMode,
    () => {
      setTheme();
    },
    { immediate: true },
  );

  function refresh() {
    editorView?.requestMeasure();
  }

  async function setLanguage(mode: MODE) {
    if (!editorView) return;
    const loader = parserDynamicImport(mode);
    const lang = await loader();

    editorView.dispatch({
      effects: languageCompartment.reconfigure(lang || []),
    });
  }

  function setTheme() {
    if (!editorView) return;
    const isDark = appStore.getDarkMode === 'dark';
    editorView.dispatch({
      effects: themeCompartment.reconfigure(isDark ? oneDark : []),
    });
  }

  function buildExtensions(): Extension[] {
    const extensions: Extension[] = [
      // 行号
      lineNumbers(),
      // 高亮当前行
      highlightActiveLine(),
      highlightActiveLineGutter(),
      // 语法高亮
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      // 历史记录
      history(),
      // 括号匹配
      bracketMatching(),
      // 自动关闭括号
      closeBrackets(),
      // 代码折叠
      codeFolding(),
      foldGutter(),
      // Lint gutter
      lintGutter(),
      // 搜索匹配高亮
      highlightSelectionMatches(),
      // 键盘映射
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...searchKeymap,
        indentWithTab,
      ]),
      // 行换行
      EditorView.lineWrapping,
      // 内容变化监听
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('change', update.state.doc.toString());
        }
      }),
      // 动态切换的 compartments
      languageCompartment.of([]),
      themeCompartment.of([]),
      editableCompartment.of(EditorView.editable.of(!props.readonly)),
    ];

    // 用户自定义扩展
    if (props.config?.extensions) {
      extensions.push(...props.config.extensions);
    }

    return extensions;
  }

  async function init() {
    if (!el.value) return;

    const extensions = buildExtensions();

    const state = EditorState.create({
      doc: props.value || '',
      extensions,
    });

    editorView = new EditorView({
      state,
      parent: el.value,
    });

    // 初始化语言和主题
    const loader = parserDynamicImport(props.mode);
    const lang = await loader();
    if (lang) {
      editorView.dispatch({
        effects: languageCompartment.reconfigure(lang),
      });
    }

    setTheme();
  }

  onMounted(async () => {
    await nextTick();
    await init();
    useWindowSizeFn(debounceRefresh);
  });

  onUnmounted(() => {
    if (editorView) {
      editorView.destroy();
      editorView = null;
    }
  });
</script>
<style>
  .cm-editor {
    height: 100%;
  }

  .cm-editor .cm-scroller {
    overflow: auto;
  }

  .cm-editor.cm-focused {
    outline: none;
  }
</style>
