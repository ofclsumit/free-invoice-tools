import { ImageEditSettings, DEFAULT_IMAGE_EDIT_SETTINGS } from "./types";

/**
 * Checks if current settings are unchanged from default
 */
export function isDefaultSettings(settings: ImageEditSettings): boolean {
  return (
    settings.zoom === DEFAULT_IMAGE_EDIT_SETTINGS.zoom &&
    settings.rotation === DEFAULT_IMAGE_EDIT_SETTINGS.rotation &&
    settings.cornerSoftness === DEFAULT_IMAGE_EDIT_SETTINGS.cornerSoftness &&
    settings.positionX === DEFAULT_IMAGE_EDIT_SETTINGS.positionX &&
    settings.positionY === DEFAULT_IMAGE_EDIT_SETTINGS.positionY
  );
}

/**
 * Renders high-quality edited image onto an off-screen canvas and returns PNG data URL.
 * Preserves alpha transparency and native image resolution.
 */
export function renderEditedImageToDataUrl(
  originalDataUrl: string,
  settings: ImageEditSettings
): Promise<string> {
  if (isDefaultSettings(settings)) {
    return Promise.resolve(originalDataUrl);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const natWidth = img.naturalWidth || img.width || 400;
        const natHeight = img.naturalHeight || img.height || 400;

        // Base canvas dimensions match natural image size
        const canvas = document.createElement("canvas");
        canvas.width = natWidth;
        canvas.height = natHeight;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(originalDataUrl);
          return;
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Clear canvas (transparent background)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply corner softness clipping if requested
        if (settings.cornerSoftness > 0) {
          const maxRadius = Math.min(natWidth, natHeight) / 2;
          const radius = (settings.cornerSoftness / 100) * maxRadius;

          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(natWidth - radius, 0);
          ctx.quadraticCurveTo(natWidth, 0, natWidth, radius);
          ctx.lineTo(natWidth, natHeight - radius);
          ctx.quadraticCurveTo(natWidth, natHeight, natWidth - radius, natHeight);
          ctx.lineTo(radius, natHeight);
          ctx.quadraticCurveTo(0, natHeight, 0, natHeight - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.clip();
        }

        // Setup transformation matrix around center
        ctx.save();
        ctx.translate(natWidth / 2, natHeight / 2);

        // Apply rotation
        const rad = (settings.rotation * Math.PI) / 180;
        ctx.rotate(rad);

        // Scale offsets relative to canvas size vs a standard 260px preview container
        const scaleFactorX = natWidth / 260;
        const scaleFactorY = natHeight / 260;
        ctx.translate(settings.positionX * scaleFactorX, settings.positionY * scaleFactorY);

        // Apply zoom scale
        ctx.scale(settings.zoom, settings.zoom);

        // Draw image centered
        ctx.drawImage(img, -natWidth / 2, -natHeight / 2, natWidth, natHeight);
        ctx.restore();

        // Export as PNG to preserve transparent alpha channel
        const outputDataUrl = canvas.toDataURL("image/png", 1.0);
        resolve(outputDataUrl);
      } catch (err) {
        console.error("Failed to render canvas edit:", err);
        resolve(originalDataUrl);
      }
    };
    img.onerror = () => {
      resolve(originalDataUrl);
    };
    img.src = originalDataUrl;
  });
}
