<template>
  <div :class="`${prefixCls}-dom`" :style="getDomStyle"></div>
  <div
    v-click-outside="handleClickOutside"
    :style="getWrapStyle"
    :class="[
      prefixCls,
      getMenuTheme,
      {
        open: openMenu,
        mini: getCollapsed,
      },
    ]"
    v-bind="getMenuEvents"
  >
    <AppLogo :showTitle="false" :class="`${prefixCls}-logo`" />

    <LayoutTrigger :class="`${prefixCls}-trigger`" />

    <ScrollContainer>
      <ul :class="`${prefixCls}-module`">
        <li
          :class="[
            `${prefixCls}-module__item `,
            {
              [`${prefixCls}-module__item--active`]: item.path === activePath,
            },
          ]"
          v-bind="getItemEvents(item)"
          v-for="item in menuModules"
          :key="item.path"
        >
          <SimpleMenuTag :item="item" dot collapseparent />
          <Icon
            :class="`${prefixCls}-module__icon`"
            :size="getCollapsed ? 16 : 20"
            :icon="item.icon || (item.meta && item.meta.icon)"
          />
          <p :class="`${prefixCls}-module__name`">
            {{ t(item.name) }}
          </p>
        </li>
      </ul>
    </ScrollContainer>

    <div :class="`${prefixCls}-menu-list`" ref="sideRef" :style="getMenuStyle">
      <div
        v-show="openMenu"
        :class="[
          `${prefixCls}-menu-list__title`,
          {
            show: openMenu,
          },
        ]"
      >
        <span class="text"> {{ title }}</span>
        <Icon
          :size="16"
          :icon="getMixSideFixed ? 'i-ri:pushpin-2-fill' : 'i-ri:pushpin-2-line'"
          class="pushpin"
          @click="handleFixedMenu"
        />
      </div>
      <ScrollContainer :class="`${prefixCls}-menu-list__content`">
        <SimpleMenu :items="childrenMenus" :theme="getMenuTheme" mixSider @menu-click="handleMenuClick" />
      </ScrollContainer>
      <div v-show="getShowDragBar && openMenu" :class="`${prefixCls}-drag-bar`" ref="dragBarRef"></div>
    </div>
  </div>
</template>
<script lang="ts">
  import type { Menu } from '@jeesite/core/router/types';
  import type { CSSProperties } from 'vue';
  import { computed, defineComponent, onMounted, ref, unref } from 'vue';
  import type { RouteLocationNormalized } from 'vue-router';
  import { ScrollContainer } from '@jeesite/core/components/Container';
  import { SimpleMenu, SimpleMenuTag } from '@jeesite/core/components/SimpleMenu';
  import { Icon } from '@jeesite/core/components/Icon';
  import { AppLogo } from '@jeesite/core/components/Application';
  import { useMenuSetting } from '@jeesite/core/hooks/setting/useMenuSetting';
  import { useDragLine } from './useLayoutSider';
  import { useGlobSetting } from '@jeesite/core/hooks/setting';
  import { useDesign } from '@jeesite/core/hooks/web/useDesign';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useGo } from '@jeesite/core/hooks/web/usePage';
  import { SIDE_BAR_MINI_WIDTH, SIDE_BAR_SHOW_TIT_MINI_WIDTH } from '@jeesite/core/enums/appEnum';
  import clickOutside from '@jeesite/core/directives/clickOutside';
  import { getChildrenMenus, getCurrentParentPath, getShallowMenus } from '@jeesite/core/router/menus';
  import { listenerRouteChange } from '@jeesite/core/logics/mitt/routeChange';
  import LayoutTrigger from '../trigger/index.vue';
  import { omit } from 'lodash-es';

  export default defineComponent({
    name: 'LayoutMixSider',
    components: {
      ScrollContainer,
      AppLogo,
      SimpleMenu,
      Icon,
      LayoutTrigger,
      SimpleMenuTag,
    },
    directives: {
      clickOutside,
    },
    setup() {
      let menuModules = ref<Menu[]>([]);
      const activePath = ref('');
      const childrenMenus = ref<Menu[]>([]);
      const openMenu = ref(false);
      const dragBarRef = ref<ElRef>(null);
      const sideRef = ref<ElRef>(null);
      const currentRoute = ref<Nullable<RouteLocationNormalized>>(null);

      const { prefixCls } = useDesign('layout-mix-sider');
      const go = useGo();
      const { t } = useI18n();
      const {
        getMenuWidth,
        getCanDrag,
        getCloseMixSidebarOnChange,
        getMenuTheme,
        getMixSideTrigger,
        getRealWidth,
        getMixSideFixed,
        mixSideHasChildren,
        setMenuSetting,
        getIsMixSidebar,
        getCollapsed,
      } = useMenuSetting();

      const { title } = useGlobSetting();

      useDragLine(sideRef, dragBarRef, true);

      const getMenuStyle = computed((): CSSProperties => {
        return {
          width: unref(openMenu) ? `${unref(getMenuWidth)}px` : 0,
          left: `${unref(getMixSideWidth)}px`,
        };
      });

      const getIsFixed = computed(() => {
        mixSideHasChildren.value = unref(childrenMenus).length > 0;
        const isFixed = unref(getMixSideFixed) && unref(mixSideHasChildren);
        if (isFixed) {
          openMenu.value = true;
        }
        return isFixed;
      });

      const getMixSideWidth = computed(() => {
        return unref(getCollapsed) ? SIDE_BAR_MINI_WIDTH : SIDE_BAR_SHOW_TIT_MINI_WIDTH;
      });

      const getDomStyle = computed((): CSSProperties => {
        const fixedWidth = unref(getIsFixed) ? unref(getRealWidth) : 0;
        const width = `${unref(getMixSideWidth) + fixedWidth}px`;
        return getWrapCommonStyle(width);
      });

      const getWrapStyle = computed((): CSSProperties => {
        const width = `${unref(getMixSideWidth)}px`;
        return getWrapCommonStyle(width);
      });

      const getMenuEvents = computed(() => {
        return !unref(getMixSideFixed)
          ? {
              onMouseleave: () => {
                setActive(true);
                closeMenu();
              },
            }
          : {};
      });

      const getShowDragBar = computed(() => unref(getCanDrag));

      onMounted(async () => {
        menuModules.value = await getShallowMenus();
      });

      listenerRouteChange((route) => {
        currentRoute.value = route;
        setActive(true);
        if (unref(getCloseMixSidebarOnChange)) {
          closeMenu();
        }
      });

      function getWrapCommonStyle(width: string): CSSProperties {
        return {
          width,
          maxWidth: width,
          minWidth: width,
          flex: `0 0 ${width}`,
        };
      }

      // Process module menu click
      async function handleModuleClick(path: string, item: any, hover = false) {
        const children = await getChildrenMenus(path);
        if (unref(activePath) === path) {
          if (!hover) {
            if (!unref(openMenu)) {
              openMenu.value = true;
            } else {
              closeMenu();
            }
          } else {
            if (!unref(openMenu)) {
              openMenu.value = true;
            }
          }
          if (!unref(openMenu)) {
            setActive();
          }
        } else {
          openMenu.value = true;
          activePath.value = path;
        }

        if (!children || children.length === 0) {
          if (!hover) handleMenuClick(path, item);
          childrenMenus.value = [];
          closeMenu();
          return;
        }
        childrenMenus.value = children;
      }

      // Set the currently active menu and submenu
      async function setActive(setChildren = false) {
        // const path = currentRoute.value?.path;
        const currRoute = unref(currentRoute);
        const path = (currRoute?.meta?.currentActiveMenu as string) || currRoute?.path;
        if (!path) return;
        activePath.value = await getCurrentParentPath(path);
        // hanldeModuleClick(parentPath);
        if (unref(getIsMixSidebar)) {
          const activeMenu = unref(menuModules).find((item) => item.path === unref(activePath));
          const p = activeMenu?.path;
          if (p) {
            const children = await getChildrenMenus(p);
            if (setChildren) {
              childrenMenus.value = children;

              if (unref(getMixSideFixed)) {
                openMenu.value = children.length > 0;
              }
            }
            if (children.length === 0) {
              childrenMenus.value = [];
            }
          }
        }
      }

      function handleMenuClick(path: string, item: any) {
        if (item.target === '_blank') {
          window.open(path);
        } else {
          go(path);
        }
      }

      function handleClickOutside() {
        setActive(true);
        closeMenu();
      }

      function getItemEvents(item: Menu) {
        const getItem = omit(item, 'children', 'icon', 'title', 'color', 'extend');
        if (unref(getMixSideTrigger) === 'hover') {
          return {
            onMouseenter: () => handleModuleClick(item.path, getItem, true),
            onClick: async () => {
              const children = await getChildrenMenus(item.path);
              if (item.path && (!children || children.length === 0)) handleMenuClick(item.path, getItem);
            },
          };
        }
        return {
          onClick: () => handleModuleClick(item.path, getItem),
        };
      }

      function handleFixedMenu() {
        setMenuSetting({
          mixSideFixed: !unref(getIsFixed),
        });
      }

      // Close menu
      function closeMenu() {
        if (!unref(getIsFixed)) {
          openMenu.value = false;
        }
      }

      return {
        t,
        prefixCls,
        menuModules,
        handleModuleClick: handleModuleClick,
        activePath,
        childrenMenus: childrenMenus,
        getShowDragBar,
        handleMenuClick,
        getMenuStyle,
        handleClickOutside,
        sideRef,
        dragBarRef,
        title,
        openMenu,
        getMenuTheme,
        getItemEvents,
        getMenuEvents,
        getDomStyle,
        handleFixedMenu,
        getMixSideFixed,
        getWrapStyle,
        getCollapsed,
      };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'jeesite-layout-mix-sider';
  @width: 80px;
  .@{prefix-cls} {
    position: fixed;
    top: 0;
    left: 0;
    z-index: @layout-mix-sider-fixed-z-index;
    height: 100%;
    overflow: hidden;
    background-color: @sider-dark-bg-color;
    transition: all 0.2s ease 0s;
    padding: 0 5px 5px; // 2

    &-dom {
      height: 100%;
      overflow: hidden;
      transition: all 0.2s ease 0s;
    }

    &-logo {
      display: flex;
      height: @header-height;
      padding-left: 0 !important;
      justify-content: center;

      img {
        padding: 0;
        width: @logo-width;
        height: @logo-width;
      }
    }

    &.light .@{prefix-cls}-logo {
      border-bottom: 1px solid rgb(238 238 238);
    }

    > .scrollbar {
      height: calc(100% - @header-height - 38px);
    }

    &.mini &-module {
      &__name {
        display: none;
      }

      &__icon {
        margin-bottom: 0;
      }
    }

    &-module {
      position: relative;
      padding-top: 3px;

      &__item {
        position: relative;
        padding: 9px 0;
        margin: 0 3px;
        color: rgb(255 255 255 / 65%);
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          color: @white;
        }

        // &:hover,
        &--active {
          border-radius: 6px; // 2

          // &::before { // 1
          //   position: absolute;
          //   top: 0;
          //   left: 0;
          //   width: 3px;
          //   height: 100%;
          //   background-color: @primary-color;
          //   content: '';
          // }
        }
      }

      &__icon {
        margin-bottom: 8px;
        font-size: 24px;
        transition: all 0.2s;
      }

      &__name {
        margin-bottom: 0;
        font-size: 12px;
        transition: all 0.2s;
      }
    }

    &.light &-module {
      &__item {
        font-weight: normal;
        color: rgb(0 0 0 / 65%);

        &--active {
          color: @primary-color;
          background-color: fade(@primary-color, 8) !important;
        }
      }
    }

    &.dark &-module {
      &__item {
        &--active {
          color: @white;
          background-color: fade(@primary-color, 25) !important;
        }
      }
    }

    &-menu-list {
      position: fixed;
      top: 0;
      width: 200px;
      height: calc(100%);
      background-color: #fff;
      transition: all 0.2s;

      &__title {
        display: flex;
        height: @header-height;
        // margin-left: -6px;
        font-size: 18px;
        color: @primary-color;
        border-bottom: 1px solid rgb(238 238 238);
        opacity: 0;
        transition: unset;
        align-items: center;
        justify-content: space-between;

        .text {
          text-wrap: nowrap;
          overflow: hidden;
        }

        &.show {
          min-width: 130px;
          opacity: 1;
          transition: all 0.5s ease;
        }

        .pushpin {
          margin-right: 6px;
          color: rgb(255 255 255 / 65%);
          cursor: pointer;

          &:hover {
            color: #fff;
          }
        }
      }

      &__content {
        height: calc(100% - @header-height) !important;

        .scrollbar__wrap {
          height: 100%;
          overflow-x: hidden;
        }

        .scrollbar__bar.is-horizontal {
          display: none;
        }

        .ant-menu {
          height: 100%;
        }

        .ant-menu-inline,
        .ant-menu-vertical,
        .ant-menu-vertical-left {
          border-right: 1px solid transparent;
        }
      }
    }

    &.light &-menu-list {
      &__content {
        box-shadow: -1px 1px 2px 0 rgb(0 0 0 / 5%);
      }

      &__title {
        .pushpin {
          color: rgb(0 0 0 / 35%);

          &:hover {
            color: rgb(0 0 0 / 85%);
          }
        }
      }
    }

    &.dark &-menu-list {
      background-color: @sider-dark-bg-color;

      &__title {
        color: @white;
        border-bottom: none;
        border-bottom: 1px solid @sider-dark-lighten-bg-color;
      }
    }

    &-trigger {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      font-size: 14px;
      color: rgb(255 255 255 / 65%);
      text-align: center;
      cursor: pointer;
      background-color: @trigger-dark-bg-color;
      height: 36px;
      line-height: 36px;
    }

    &.light &-trigger {
      color: rgb(0 0 0 / 65%);
      background-color: #fff;
      border-top: 1px solid #eee;
    }

    &-drag-bar {
      position: absolute;
      top: 50px;
      right: -1px;
      width: 1px;
      height: calc(100% - 50px);
      cursor: ew-resize;
      background-color: #f8f8f9;
      border-top: none;
      border-bottom: none;
      box-shadow: 0 0 4px 0 rgb(28 36 56 / 15%);
    }
  }
</style>
