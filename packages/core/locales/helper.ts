import type { LocaleType } from '@jeesite/types/config';

import { set } from 'lodash-es';

export const loadLocalePool: LocaleType[] = [];

export function setHtmlPageLang(locale: LocaleType) {
  document.querySelector('html')?.setAttribute('lang', locale);
}

export function setLoadLocalePool(cb: (loadLocalePool: LocaleType[]) => void) {
  cb(loadLocalePool);
}

/**
 * 将 core 或业务模块的语言文件路径转换为消息对象路径。
 * @param key 语言文件路径
 * @param locale 当前语言标识
 * @returns 可供 genMessage 解析的相对资源路径
 */
function getLocaleFileName(key: string, locale: string) {
  const normalizedKey = key.replace(/\\/g, '/');
  const localeRoot = `/locales/lang/${locale}/`;
  const localeRootIndex = normalizedKey.indexOf(localeRoot);

  if (localeRootIndex >= 0) {
    return normalizedKey.slice(localeRootIndex + localeRoot.length);
  }

  return normalizedKey.replace(`./${locale}/`, '').replace(/^\.\//, '');
}

export function genMessage(langs: Record<string, Record<string, any>>, prefix = 'lang') {
  const obj: Recordable = {};

  Object.keys(langs).forEach((key) => {
    const langFileModule = langs[key].default;
    let fileName = getLocaleFileName(key, prefix);
    const lastIndex = fileName.lastIndexOf('.');
    fileName = fileName.substring(0, lastIndex);
    const keyList = fileName.split('/');
    const moduleName = keyList.shift();
    const objKey = keyList.join('.');

    if (moduleName) {
      if (objKey) {
        set(obj, moduleName, obj[moduleName] || {});
        set(obj[moduleName], objKey, langFileModule);
      } else {
        set(obj, moduleName, langFileModule || {});
      }
    }
  });
  return obj;
}
