export const COLOR_PICKER_PATH = "/figma/swatches/color-picker.png";

/** @deprecated Use COLOR_PICKER_PATH */
export const COLOR_WHEEL_PATH = COLOR_PICKER_PATH;

/** Sentinel value for the picker slot — never stored as the selected color. */
export const COLOR_PICKER_SWATCH_ID = "picker";

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
  return `/figma/patterns/${id}.svg`;
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

  return { backgroundColor: value };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
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
  if (isGradientFill(value)) {
    const image = await loadImage(COLOR_PICKER_PATH);
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

    const image = await loadImage(path);
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
