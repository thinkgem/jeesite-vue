import type Cropper from 'cropperjs';

export interface CropendResult {
  imgBase64: string;
}

// 工具栏控制对象（由 Cropper.vue 在 ready 事件中暴露）
export interface CropperToolbarApi {
  reset(): void;
  rotate(angle: number): void;
  scaleX(scale?: number): void;
  scaleY(scale?: number): void;
  zoom(ratio: number): void;
}

export type { Cropper };
