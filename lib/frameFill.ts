import { theme } from "@/themes";
import { COLOR_PICKER_SWATCH_ID } from "@/lib/colorSwatch";
import { loadCachedImage } from "@/lib/imageCache";
import type { FrameId } from "@/types/photobooth";

export { COLOR_PICKER_SWATCH_ID };

export const COLOR_PICKER_PATH = theme.assets.colorPicker;

/** @deprecated Use COLOR_PICKER_PATH */
export const COLOR_WHEEL_PATH = COLOR_PICKER_PATH;

/** Legacy rainbow fill id kept for older saved state / hot-reload bundles. */
export const RAINBOW_FILL_ID = "gradient:rainbow";

export function isPatternFill(value: string): boolean {
  return value.startsWith("pattern:");
}

export function isGradientFill(value: string): boolean {
  return value.startsWith("gradient:");
}

export function isPickerSwatch(value: string): boolean {
  return value === COLOR_PICKER_SWATCH_ID;
}

export function getPatternPath(value: string): string | null {
  if (!isPatternFill(value)) return null;
  const id = value.slice("pattern:".length);
  if (id.includes(".")) {
    return `${theme.assets.patternsBase}/${id}`;
  }
  return `${theme.assets.patternsBase}/${id}.png`;
}

/**
 * "Overlay" fills are full-illustration frame overlays (a decorative design
 * drawn on top of the photos) rather than a background fill/color, with a
 * separate art file per frame layout — e.g. "overlay:frame6" resolves to
 * `/sinno/patterns/frame6/{1..5}.svg` depending on the selected FrameId.
 */
export function isOverlayFill(value: string): boolean {
  return value.startsWith("overlay:");
}

const FRAME_INDEX: Record<FrameId, number> = {
  frame1: 1,
  frame2: 2,
  frame3: 3,
  frame4: 4,
  frame5: 5,
};

export function getOverlayPath(value: string, frameId: FrameId): string | null {
  if (!isOverlayFill(value)) return null;
  const group = value.slice("overlay:".length);
  const index = FRAME_INDEX[frameId];
  if (!group || !index) return null;
  return `${theme.assets.patternsBase}/${group}/${index}.png`;
}

/** Small dedicated preview thumbnail for an overlay swatch (independent of frame layout). */
export function getOverlayCoverPath(value: string): string | null {
  if (!isOverlayFill(value)) return null;
  const group = value.slice("overlay:".length);
  if (!group) return null;
  return `${theme.assets.patternsBase}/${group}/cover.png`;
}

/** Neutral backdrop painted behind photos when an overlay fill is selected. */
export const OVERLAY_FILL_BACKDROP = "#FFFFFF";

/** Prewarm the canvas image cache for a set of swatch values (pattern/gradient/overlay fills). */
export function preloadFillSwatches(values: string[], frameId?: FrameId): void {
  for (const value of values) {
    if (isGradientFill(value) || isPickerSwatch(value)) {
      loadCachedImage(COLOR_PICKER_PATH).catch(() => {});
      continue;
    }

    if (isOverlayFill(value)) {
      const coverPath = getOverlayCoverPath(value);
      if (coverPath) {
        loadCachedImage(coverPath).catch(() => {});
      }
      const overlayPath = frameId ? getOverlayPath(value, frameId) : null;
      if (overlayPath) {
        loadCachedImage(overlayPath).catch(() => {});
      }
      continue;
    }

    const path = getPatternPath(value);
    if (path) {
      loadCachedImage(path).catch(() => {});
    }
  }
}

export function getSwatchPreviewStyle(value: string): {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
} {
  if (isGradientFill(value) || isPickerSwatch(value)) {
    return {
      backgroundImage: `url(${COLOR_PICKER_PATH})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  if (isPatternFill(value)) {
    const path = getPatternPath(value);
    return path
      ? {
          backgroundImage: `url(${path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: "#CCCCCC" };
  }

  if (isOverlayFill(value)) {
    const path = getOverlayCoverPath(value);
    return path
      ? {
          backgroundColor: OVERLAY_FILL_BACKDROP,
          backgroundImage: `url(${path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: "#CCCCCC" };
  }

  return { backgroundColor: value };
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

export async function applyCanvasFill(
  ctx: CanvasRenderingContext2D,
  value: string,
  width: number,
  height: number,
): Promise<void> {
  if (isOverlayFill(value)) {
    ctx.fillStyle = OVERLAY_FILL_BACKDROP;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (isGradientFill(value)) {
    const image = await loadCachedImage(COLOR_PICKER_PATH);
    drawCoverImage(ctx, image, width, height);
    return;
  }

  if (isPatternFill(value)) {
    const path = getPatternPath(value);
    if (!path) {
      ctx.fillStyle = "#CCCCCC";
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const image = await loadCachedImage(path);
    if (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".webp")) {
      drawCoverImage(ctx, image, width, height);
      return;
    }

    const pattern = ctx.createPattern(image, "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
      return;
    }
  }

  ctx.fillStyle = value;
  ctx.fillRect(0, 0, width, height);
}

export function getCaptionFillStyle(
  ctx: CanvasRenderingContext2D,
  value: string,
  width: number,
): string | CanvasGradient {
  if (isGradientFill(value)) {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#ff0000");
    gradient.addColorStop(0.17, "#ff8800");
    gradient.addColorStop(0.33, "#ffff00");
    gradient.addColorStop(0.5, "#00ff00");
    gradient.addColorStop(0.67, "#0088ff");
    gradient.addColorStop(0.83, "#8800ff");
    gradient.addColorStop(1, "#ff0000");
    return gradient;
  }

  return value;
}
