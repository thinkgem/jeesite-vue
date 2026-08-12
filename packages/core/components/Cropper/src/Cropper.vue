<!--
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <div :class="getClass" :style="getWrapperStyle">
    <img v-show="!isReady" ref="imgElRef" :src="src" :alt="alt" :crossorigin="crossorigin" :style="getImageStyle" />
  </div>
</template>
<script lang="ts" setup name="CropperImage">
  import type { CSSProperties, PropType } from 'vue';
  import { shallowRef } from 'vue';
  import { onMounted, ref, unref, computed, onUnmounted, useAttrs } from 'vue';
  import Cropper from 'cropperjs';
  import type { CropperCanvas, CropperImage, CropperSelection } from 'cropperjs';
  import { useDebounceFn } from '@vueuse/shared';

  // 裁剪模板（Cropper.js 2.x Web Component）。
  // circled 时使用圆形选区（aspect-ratio 1 + 外部 CSS 圆形边框），非 circled 使用矩形 outline 边框
  function buildTemplate(circled: boolean) {
    return `<cropper-canvas background>
  <cropper-image rotatable scalable translatable></cropper-image>
  <cropper-shade></cropper-shade>
  <cropper-handle action="move" plain></cropper-handle>
  <cropper-selection initial-coverage="1" movable resizable ${circled ? 'aspect-ratio="1"' : 'outlined'}>
    <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0)"></cropper-handle>
    <cropper-handle action="n-resize"></cropper-handle>
    <cropper-handle action="e-resize"></cropper-handle>
    <cropper-handle action="s-resize"></cropper-handle>
    <cropper-handle action="w-resize"></cropper-handle>
    <cropper-handle action="ne-resize"></cropper-handle>
    <cropper-handle action="nw-resize"></cropper-handle>
    <cropper-handle action="se-resize"></cropper-handle>
    <cropper-handle action="sw-resize"></cropper-handle>
  </cropper-selection>
</cropper-canvas>`;
  }

  const props = defineProps({
    src: { type: String, required: true },
    alt: { type: String },
    circled: { type: Boolean, default: true },
    realTimePreview: { type: Boolean, default: true },
    height: { type: [String, Number], default: '360px' },
    crossorigin: {
      type: String as PropType<'' | 'anonymous' | 'use-credentials' | undefined>,
      default: undefined,
    },
    imageStyle: { type: Object as PropType<CSSProperties>, default: () => ({}) },
    options: { type: Object as PropType<Recordable>, default: () => ({}) },
  });

  const emit = defineEmits(['cropend', 'ready', 'cropendError']);

  const attrs = useAttrs();

  const imgElRef = shallowRef<HTMLImageElement>();
  const cropper = ref<Cropper>();
  const canvasEl = shallowRef<CropperCanvas | null>(null);
  const imageEl = shallowRef<CropperImage | null>(null);
  const selectionEl = shallowRef<CropperSelection | null>(null);
  const isReady = ref(false);

  const debounceRealTimeCroppered = useDebounceFn(realTimeCroppered, 80);

  const getImageStyle = computed((): CSSProperties => {
    return {
      height: props.height,
      maxWidth: '90%',
      ...props.imageStyle,
    };
  });

  const getClass = computed(() => {
    return [
      'jeesite-cropper-image',
      attrs.class,
      {
        ['jeesite-cropper-image--circled']: props.circled,
      },
    ];
  });

  const getWrapperStyle = computed((): CSSProperties => {
    return { height: `${props.height}`.replace(/px/, '') + 'px' };
  });

  // 缩放状态（供工具栏 scaleX/scaleY 精确设置）
  let scaleX = 1;
  let scaleY = 1;

  // 暴露给父组件的控制对象（CopperModal 工具栏调用）
  const api = {
    reset() {
      imageEl.value?.$resetTransform();
      selectionEl.value?.$reset();
      scaleX = 1;
      scaleY = 1;
    },
    rotate(angle: number) {
      imageEl.value?.$rotate(`${angle}deg`);
    },
    scaleX(scale?: number) {
      scale = scale ?? (scaleX === 1 ? -1 : 1);
      imageEl.value?.$scale(scale / scaleX, 1);
      scaleX = scale;
    },
    scaleY(scale?: number) {
      scale = scale ?? (scaleY === 1 ? -1 : 1);
      imageEl.value?.$scale(1, scale / scaleY);
      scaleY = scale;
    },
    zoom(ratio: number) {
      imageEl.value?.$scale(1 + (ratio || 0));
    },
  };

  onMounted(init);

  onUnmounted(() => {
    cropper.value?.destroy();
  });

  async function init() {
    const imgEl = unref(imgElRef);
    if (!imgEl) {
      return;
    }
    cropper.value = new Cropper(imgEl, {
      template: buildTemplate(props.circled),
    });
    canvasEl.value = cropper.value.getCropperCanvas();
    imageEl.value = cropper.value.getCropperImage();
    selectionEl.value = cropper.value.getCropperSelection();

    // 设置裁剪比例（默认 1:1）
    const aspectRatio = props.options?.aspectRatio ?? 1;
    if (selectionEl.value && typeof aspectRatio === 'number' && aspectRatio > 0) {
      selectionEl.value.aspectRatio = aspectRatio;
    }

    // 实时裁剪预览
    canvasEl.value?.addEventListener('action', debounceRealTimeCroppered);

    imageEl.value?.$ready(() => {
      isReady.value = true;
      realTimeCroppered();
      emit('ready', api);
    });
  }

  function realTimeCroppered() {
    props.realTimePreview && croppered();
  }

  async function croppered() {
    const selection = unref(selectionEl);
    if (!selection) {
      return;
    }
    try {
      const canvas = await selection.$toCanvas({
        beforeDraw: (context: CanvasRenderingContext2D, canvasEl: HTMLCanvasElement) => {
          const w = canvasEl.width;
          const h = canvasEl.height;
          if (props.circled) {
            context.clearRect(0, 0, w, h);
            context.beginPath();
            context.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
            context.clip();
          }
        },
      });
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) {
          return;
        }
        const fileReader: FileReader = new FileReader();
        fileReader.readAsDataURL(blob);
        fileReader.onloadend = (e) => {
          emit('cropend', {
            imgBase64: (e.target?.result as string) ?? '',
          });
        };
        fileReader.onerror = () => {
          emit('cropendError');
        };
      }, 'image/png');
    } catch (e) {
      emit('cropendError');
    }
  }
</script>
<style lang="less">
  // 新版 Cropper.js 2.x 使用 Shadow DOM。
  // cropper-canvas 的 :host 未设置 height:100%，需在此显式让其占满容器。
  .jeesite-cropper-image {
    position: relative;
    overflow: hidden;

    > cropper-canvas {
      width: 100%;
      height: 100%;
    }

    &--circled {
      > cropper-canvas {
        > cropper-selection {
          aspect-ratio: 1;
          border: 1px solid var(--theme-color, #39f);
        }

        > cropper-shade {
          border-radius: 50%;
        }
      }
    }
  }
</style>
