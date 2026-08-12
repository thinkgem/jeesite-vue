import type { LanguageSupport } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';

/**
 * CodeMirror 6 支持的语言模式枚举
 * 保留原有 MODE 枚举名称以保持向后兼容
 */
export enum MODE {
  JSON = 'json',
  APL = 'apl',
  ASCIIARMOR = 'asciiarmor',
  ASTERISK = 'asterisk',
  BRAINFUCK = 'brainfuck',
  CLIKE = 'clike',
  CLOJURE = 'clojure',
  CMAKE = 'cmake',
  COBOL = 'cobol',
  COFFEESCRIPT = 'coffeescript',
  COMMONLISP = 'commonlisp',
  CRYSTAL = 'crystal',
  CSS = 'css',
  CYPHER = 'cypher',
  D = 'd',
  DART = 'dart',
  DIFF = 'diff',
  DJANGO = 'django',
  DOCKERFILE = 'dockerfile',
  DTD = 'dtd',
  DYLAN = 'dylan',
  EBNF = 'ebnf',
  ECL = 'ecl',
  EIFFEL = 'eiffel',
  ELM = 'elm',
  ERLANG = 'erlang',
  FACTOR = 'factor',
  FCL = 'fcl',
  FORTH = 'forth',
  FORTRAN = 'fortran',
  GAS = 'gas',
  GFM = 'gfm',
  GHERKIN = 'gherkin',
  GO = 'go',
  GROOVY = 'groovy',
  HAML = 'haml',
  HANDLEBARS = 'handlebars',
  HASKELL = 'haskell',
  HAXE = 'haxe',
  HTMLEMBEDDED = 'htmlembedded',
  HTMLMIXED = 'htmlmixed',
  HTTP = 'http',
  IDL = 'idl',
  JAVASCRIPT = 'javascript',
  JINJA2 = 'jinja2',
  JSX = 'jsx',
  JULIA = 'julia',
  LIVESCRIPT = 'livescript',
  LUA = 'lua',
  MARKDOWN = 'markdown',
  MATHEMATICA = 'mathematica',
  MBOX = 'mbox',
  MIRC = 'mirc',
  MLLIKE = 'mllike',
  MODELICA = 'modelica',
  MSCGEN = 'mscgen',
  MUMPS = 'mumps',
  NGINX = 'nginx',
  NSIS = 'nsis',
  NTRIPLES = 'ntriples',
  OCTAVE = 'octave',
  OZ = 'oz',
  PASCAL = 'pascal',
  PEGJS = 'pegjs',
  PERL = 'perl',
  PHP = 'php',
  PIG = 'pig',
  POWERSHELL = 'powershell',
  PROPERTIES = 'properties',
  PROTOBUF = 'protobuf',
  PUG = 'pug',
  PUPPET = 'puppet',
  PYTHON = 'python',
  Q = 'q',
  R = 'r',
  RPM = 'rpm',
  RST = 'rst',
  RUBY = 'ruby',
  RUST = 'rust',
  SAS = 'sas',
  SASS = 'sass',
  SCHEME = 'scheme',
  SHELL = 'shell',
  SIEVE = 'sieve',
  SLIM = 'slim',
  SMALLTALK = 'smalltalk',
  SMARTY = 'smarty',
  SOLR = 'solr',
  SOY = 'soy',
  SPARQL = 'sparql',
  SPREADSHEET = 'spreadsheet',
  SQL = 'sql',
  STEX = 'stex',
  STYLUS = 'stylus',
  SWIFT = 'swift',
  TCL = 'tcl',
  TEXTILE = 'textile',
  TIDDLYWIKI = 'tiddlywiki',
  TIKI = 'tiki',
  TOML = 'toml',
  TORNADO = 'tornado',
  TROFF = 'troff',
  TTCN = 'ttcn',
  TURTLE = 'turtle',
  TWIG = 'twig',
  VB = 'vb',
  VBSCRIPT = 'vbscript',
  VELOCITY = 'velocity',
  VERILOG = 'verilog',
  VHDL = 'vhdl',
  VUE = 'vue',
  WAST = 'wast',
  WEBIDL = 'webidl',
  XML = 'xml',
  XQUERY = 'xquery',
  YACAS = 'yacas',
  YAML = 'yaml',
  Z80 = 'z80',
}

/**
 * 主题枚举
 */
export enum THEME {
  ONE_DARK = 'one-dark',
  NONE = 'none',
}

/**
 * 语言到 LanguageSupport 的动态加载映射
 * CodeMirror 6 使用 @codemirror/lang-* 包按需加载
 */
export function getLanguageLoader(mode: MODE): () => Promise<LanguageSupport | null> {
  const loaders: Record<string, () => Promise<LanguageSupport | null>> = {
    [MODE.JSON]: async () => {
      const { json } = await import('@codemirror/lang-json');
      return json();
    },
    [MODE.JAVASCRIPT]: async () => {
      const { javascript } = await import('@codemirror/lang-javascript');
      return javascript();
    },
    [MODE.JSX]: async () => {
      const { javascript } = await import('@codemirror/lang-javascript');
      return javascript({ jsx: true });
    },
    [MODE.HTMLMIXED]: async () => {
      const { html } = await import('@codemirror/lang-html');
      return html();
    },
    // [MODE.XML]: async () => {
    //   const { xml } = await import('@codemirror/lang-xml');
    //   return xml();
    // },
    // [MODE.CSS]: async () => {
    //   const { css } = await import('@codemirror/lang-css');
    //   return css();
    // },
    // [MODE.SASS]: async () => {
    //   const { sass } = await import('@codemirror/lang-sass');
    //   return sass();
    // },
    // [MODE.MARKDOWN]: async () => {
    //   const { markdown } = await import('@codemirror/lang-markdown');
    //   return markdown();
    // },
    // [MODE.GFM]: async () => {
    //   const { markdown } = await import('@codemirror/lang-markdown');
    //   return markdown();
    // },
    // [MODE.PYTHON]: async () => {
    //   const { python } = await import('@codemirror/lang-python');
    //   return python();
    // },
    // [MODE.GO]: async () => {
    //   const { go } = await import('@codemirror/lang-go');
    //   return go();
    // },
    // [MODE.RUST]: async () => {
    //   const { rust } = await import('@codemirror/lang-rust');
    //   return rust();
    // },
    // [MODE.SQL]: async () => {
    //   const { sql } = await import('@codemirror/lang-sql');
    //   return sql();
    // },
    // [MODE.PHP]: async () => {
    //   const { php } = await import('@codemirror/lang-php');
    //   return php();
    // },
    // [MODE.VUE]: async () => {
    //   const { vue } = await import('@codemirror/lang-vue');
    //   return vue();
    // },
    // [MODE.YAML]: async () => {
    //   const { yaml } = await import('@codemirror/lang-yaml');
    //   return yaml();
    // },
    // [MODE.CLIKE]: async () => {
    //   const { cpp } = await import('@codemirror/lang-cpp');
    //   return cpp();
    // },
    // [MODE.GROOVY]: async () => {
    //   const { java } = await import('@codemirror/lang-java');
    //   return java();
    // },
    [MODE.HTMLEMBEDDED]: async () => {
      const { html } = await import('@codemirror/lang-html');
      return html();
    },
    // 以下语言没有官方的 CM6 lang 包，回退到纯文本模式（返回 null）
    // 用户看到的是纯文本，但不会报错
  };

  return loaders[mode] || (async () => null);
}

/**
 * 向后兼容的 parserDynamicImport 函数
 * 原 v5 版本返回 () => Promise<any>，直接 import codemirror mode 文件
 * v6 版本返回 () => Promise<LanguageSupport | null>
 * 对于没有官方 CM6 lang 包的语言，返回 null 表示使用纯文本模式
 */
export function parserDynamicImport(mode: MODE): () => Promise<LanguageSupport | null> {
  return getLanguageLoader(mode);
}

/**
 * 获取主题扩展
 */
export function getThemeExtension(theme: THEME): Extension {
  switch (theme) {
    case THEME.ONE_DARK:
      return oneDark;
    case THEME.NONE:
    default:
      return [];
  }
}
