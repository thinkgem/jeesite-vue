import { createAsyncComponent } from '@jeesite/core/utils/factory/createAsyncComponent';

export * from './src/codemirror/typing';
export const CodeEditor = createAsyncComponent(() => import('./src/codemirror/CodeEditor.vue'), { loading: true });
export const JsonPreview = createAsyncComponent(() => import('./src/json-preview/JsonPreview.vue'), { loading: true });
export const MonacoEditor = createAsyncComponent(() => import('./src/MonacoEditor/index.vue'), { loading: true });
