import type { Ref } from 'vue';

import { computed, unref, onMounted, nextTick, ref } from 'vue';

import { TriggerEnum } from '@jeesite/core/enums/menuEnum';

import { useMenuSetting } from '@jeesite/core/hooks/setting/useMenuSetting';
import { getRefElement } from '@jeesite/core/utils/domUtils';
import { useDebounceFn } from '@vueuse/core';

interface DraggableHTMLElement extends HTMLElement {
  left: number;
  releaseCapture?: () => void;
  setCapture?: () => void;
}

/**
 * Handle related operations of menu events
 */
export function useSiderEvent() {
  const brokenRef = ref(false);

  const { getMiniWidthNumber } = useMenuSetting();

  const getCollapsedWidth = computed(() => {
    return unref(brokenRef) ? 0 : unref(getMiniWidthNumber);
  });

  function onBreakpointChange(broken: boolean) {
    brokenRef.value = broken;
  }

  return { getCollapsedWidth, onBreakpointChange };
}

/**
 * Handle related operations of menu folding
 */
export function useTrigger(getIsMobile: Ref<boolean>) {
  const { getTrigger, getSplit } = useMenuSetting();

  const getShowTrigger = computed(() => {
    const trigger = unref(getTrigger);

    return trigger !== TriggerEnum.NONE && !unref(getIsMobile) && (trigger === TriggerEnum.FOOTER || unref(getSplit));
  });

  const getTriggerAttr = computed(() => {
    if (unref(getShowTrigger)) {
      return {};
    }
    return {
      trigger: null,
    };
  });

  return { getTriggerAttr, getShowTrigger };
}

/**
 * Handle menu drag and drop related operations
 * @param siderRef
 * @param dragBarRef
 */
export function useDragLine(siderRef: Ref<any>, dragBarRef: Ref<any>, mix = false) {
  const { getMiniWidthNumber, getCollapsed, setMenuSetting } = useMenuSetting();

  onMounted(() => {
    nextTick(() => {
      const exec = useDebounceFn(changeWrapWidth, 80);
      exec();
    });
  });

  function getEl(elRef: Ref<ElRef | ComponentRef>): HTMLElement | null {
    return getRefElement(unref(elRef));
  }

  function handleMouseMove(ele: DraggableHTMLElement, wrap: HTMLElement, clientX: number) {
    document.onmousemove = function (innerE) {
      let iT = ele.left + (innerE.clientX - clientX);
      const maxT = 800;
      const minT = unref(getMiniWidthNumber);
      iT < 0 && (iT = 0);
      iT > maxT && (iT = maxT);
      iT < minT && (iT = minT);
      ele.style.left = wrap.style.width = iT + 'px';
      return false;
    };
  }

  // Drag and drop in the menu area-release the mouse
  function removeMouseup(ele: DraggableHTMLElement, wrap: HTMLElement) {
    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
      wrap.style.transition = 'width 0.2s';
      const width = parseInt(wrap.style.width);

      if (!mix) {
        const miniWidth = unref(getMiniWidthNumber);
        if (!unref(getCollapsed)) {
          width > miniWidth + 20 ? setMenuSetting({ menuWidth: width }) : setMenuSetting({ collapsed: true });
        } else {
          width > miniWidth && setMenuSetting({ collapsed: false, menuWidth: width });
        }
      } else {
        setMenuSetting({ menuWidth: width });
      }

      ele.releaseCapture?.();
    };
  }

  function changeWrapWidth() {
    const ele = getEl(dragBarRef) as DraggableHTMLElement | null;
    if (!ele) return;
    const wrap = getEl(siderRef);
    if (!wrap) return;

    ele.onmousedown = (e: any) => {
      wrap.style.transition = 'unset';
      const clientX = e?.clientX;
      ele.left = ele.offsetLeft;
      handleMouseMove(ele, wrap, clientX);
      removeMouseup(ele, wrap);
      ele.setCapture?.();
      return false;
    };
  }

  return {};
}
