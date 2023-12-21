<template>
  <StyleProvider hash-priority="high" :transformers="[legacyLogicalPropertiesTransformer]">
    <ConfigProvider :locale="getAntdLocale" :theme="getTheme">
      <AppProvider prefixCls="jeesite">
        <RouterView />
      </AppProvider>
    </ConfigProvider>
  </StyleProvider>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import {
    StyleProvider,
    legacyLogicalPropertiesTransformer,
    ConfigProvider,
    theme,
  } from 'ant-design-vue';
  import { type ThemeConfig } from 'ant-design-vue/es/config-provider/context';
  import { AppProvider } from '/@/components/Application';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { ThemeEnum } from '/@/enums/appEnum';
  import { useLocale } from '/@/locales/useLocale';
  import { useTitle } from '/@/hooks/web/useTitle';
  import { darkPrimaryColor } from '../build/config/themeConfig';
  import 'dayjs/locale/zh-cn';

  // support Multi-language
  const { getAntdLocale } = useLocale();
  const { getDarkMode, getThemeColor } = useRootSetting();

  const getTheme = computed<ThemeConfig>(() => {
    const isDark = unref(getDarkMode) === ThemeEnum.DARK;
    const themeColor = getThemeColor.value;
    return {
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: isDark ? darkPrimaryColor : themeColor,
        colorLink: isDark ? darkPrimaryColor : themeColor,
        colorInfo: isDark ? darkPrimaryColor : themeColor,
      },
    };
  });

  // Listening to page changes and dynamically changing site titles
  useTitle();
</script>
<style lang="less">
  body {
    line-height: 1.5715;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji';
  }
</style>
