export interface ImageEditSettings {
  zoom: number; // 0.5 to 4 (default 1)
  rotation: number; // 0, 90, 180, 270 (degrees)
  cornerSoftness: number; // 0 to 100 (% radius)
  positionX: number; // pixel offset X
  positionY: number; // pixel offset Y
}

export const DEFAULT_IMAGE_EDIT_SETTINGS: ImageEditSettings = {
  zoom: 1,
  rotation: 0,
  cornerSoftness: 0,
  positionX: 0,
  positionY: 0,
};

export type ImageAssetType = "logo" | "signature" | "stamp" | "watermark" | "photo" | "generic";
