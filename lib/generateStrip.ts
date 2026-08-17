import type { FrameConfig } from "@/types/photobooth";
import { theme } from "@/themes";
import {
  applyCanvasFill,
  getCaptionFillStyle,
  getOverlayPath,
  isGradientFill,
  isOverlayFill,
  isPatternFill,
} from "@/lib/frameFill";
import { loadCachedImage } from "@/lib/imageCache";
import {
  clampStripCaption,
  getFittedStripCaptionFontSize,
  getStripCaptionPositionY,
  scaleStripCaptionOffsetToExport,
  STRIP_CAPTION_Y_OFFSET_PX,
} from "@/lib/stripCaption";

const EXPORT_WIDTH = 1200;
const captionFontFamily = theme.fonts.captionFamily;
const downloadPrefix = theme.brand.downloadPrefix;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageAspect = image.width / image.height;
  const slotAspect = width / height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.width;
  let sourceHeight = image.height;

  if (imageAspect > slotAspect) {
    sourceWidth = image.height * slotAspect;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / slotAspect;
    sourceY = (image.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

const svgTextCache = new Map<string, Promise<string>>();

function loadSvgText(svgPath: string): Promise<string> {
  const cached = svgTextCache.get(svgPath);
  if (cached) return cached;

  const promise = fetch(svgPath).then((response) => response.text());
  svgTextCache.set(svgPath, promise);
  return promise;
}

const coloredFrameSvgCache = new Map<string, Promise<HTMLImageElement>>();

/** Recolored frame SVG rasterized to an image, memoized per (svgPath, color). */
function loadFrameSvg(frameColor: string, svgPath: string): Promise<HTMLImageElement> {
  const cacheKey = `${svgPath}::${frameColor}`;
  const cached = coloredFrameSvgCache.get(cacheKey);
  if (cached) return cached;

  const promise = (async () => {
    const svgText = await loadSvgText(svgPath);
    const coloredSvg = svgText.replace(/fill="black"/g, `fill="${frameColor}"`);
    const blob = new Blob([coloredSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    try {
      return await loadImage(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  })();

  coloredFrameSvgCache.set(cacheKey, promise);
  return promise;
}

/** Prewarm the SVG text + black mask for a frame so the first Customize render is instant. */
export function preloadFrameOverlay(svgPath: string): void {
  loadFrameSvg("#000000", svgPath).catch(() => {});
}

async function drawFrameOverlay(
  ctx: CanvasRenderingContext2D,
  frameColor: string,
  frame: FrameConfig,
  width: number,
  height: number,
): Promise<void> {
  if (isOverlayFill(frameColor)) {
    const overlayPath = getOverlayPath(frameColor, frame.id);
    if (!overlayPath) return;
    const art = await loadCachedImage(overlayPath);
    ctx.drawImage(art, 0, 0, width, height);
    return;
  }

  const svgPath = frame.svgPath;

  if (
    !isPatternFill(frameColor) &&
    !isGradientFill(frameColor) &&
    frameColor.startsWith("#")
  ) {
    const colored = await loadFrameSvg(frameColor, svgPath);
    ctx.drawImage(colored, 0, 0, width, height);
    return;
  }

  const mask = await loadFrameSvg("#000000", svgPath);

  const overlay = document.createElement("canvas");
  overlay.width = width;
  overlay.height = height;
  const overlayCtx = overlay.getContext("2d");
  if (!overlayCtx) return;

  await applyCanvasFill(overlayCtx, frameColor, width, height);
  overlayCtx.globalCompositeOperation = "destination-in";
  overlayCtx.drawImage(mask, 0, 0, width, height);
  ctx.drawImage(overlay, 0, 0, width, height);
}

export async function generateStrip(
  photos: string[],
  frame: FrameConfig,
  frameColor: string,
  textColor: string,
  captionText: string,
  extraCaptionYOffsetPx = 0,
): Promise<string> {
  const stripWidth = EXPORT_WIDTH;
  const stripHeight = Math.round(stripWidth / frame.aspectRatio);

  const canvas = document.createElement("canvas");
  canvas.width = stripWidth;
  canvas.height = stripHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }


  await applyCanvasFill(ctx, frameColor, stripWidth, stripHeight);

  const images = await Promise.all(photos.map((photo) => loadImage(photo)));

  images.forEach((image, index) => {
    const slot = frame.slots[index];
    if (!slot) return;

    const x = slot.x * stripWidth;
    const y = slot.y * stripHeight;
    const width = slot.width * stripWidth;
    const height = slot.height * stripHeight;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    drawCoverImage(ctx, image, x, y, width, height);
    ctx.restore();
  });

  await drawFrameOverlay(ctx, frameColor, frame, stripWidth, stripHeight);

  if (captionText.trim()) {
    const caption = clampStripCaption(captionText).trim();
    const fontSize = getFittedStripCaptionFontSize(
      stripWidth,
      caption,
      frame.captionFontSizeScale ?? 1,
      (size) => {
      ctx.font = `${size}px ${captionFontFamily}`;
      return ctx.measureText(caption).width;
    },
    );
    ctx.fillStyle = getCaptionFillStyle(ctx, textColor, stripWidth);
    ctx.font = `${fontSize}px ${captionFontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const captionYOffset =
      (frame.captionYOffset ?? STRIP_CAPTION_Y_OFFSET_PX) +
      scaleStripCaptionOffsetToExport(extraCaptionYOffsetPx, stripHeight);
    ctx.fillText(
      caption,
      stripWidth / 2,
      getStripCaptionPositionY(frame.captionY, stripHeight, captionYOffset),
    );
  }

  return canvas.toDataURL("image/png");
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Downloads via a short-lived Blob URL rather than putting the (potentially
 * multi-MB, since the export is a lossless PNG) data: URI directly in the
 * anchor href — large data: URIs are known to silently fail to navigate on
 * some mobile browsers, whereas Blob URLs are a short opaque reference.
 */
export async function downloadStrip(dataUrl: string, filename?: string): Promise<void> {
  const name = filename ?? `${downloadPrefix}-${Date.now()}.png`;
  const blob = await dataUrlToBlob(dataUrl);
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke after a delay rather than immediately — some mobile browsers
  // pick up the blob asynchronously after the click.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
}

function isMobileGalleryTarget(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

async function dataUrlToPngFile(
  dataUrl: string,
  filename: string,
): Promise<File> {
  const blob = await dataUrlToBlob(dataUrl);
  return new File([blob], filename, { type: "image/png" });
}

function canSharePngFile(file: File): boolean {
  if (typeof navigator.share !== "function") return false;
  return !navigator.canShare || navigator.canShare({ files: [file] });
}

/**
 * Save strip to Photos/Gallery on mobile via the system share sheet
 * (choose "Save Image" / "Save to Photos"). Falls back to file download on
 * desktop, and on any failure in the share path — unsupported, permission
 * denied, the data: URI → File conversion failing, etc. — except the user
 * cancelling the share sheet themselves, which should not trigger a fallback.
 *
 * The mobile branch used to await the file conversion outside any try/catch:
 * if it threw (a real risk given the multi-MB PNG export), saveStrip's
 * promise rejected with no fallback, and since callers invoke this as
 * `void saveStrip(...)`, the failure was a silent unhandled rejection — the
 * Save button did nothing, with no error and no download.
 */
export async function saveStrip(
  dataUrl: string,
  filename?: string,
): Promise<void> {
  const name = filename ?? `${downloadPrefix}-${Date.now()}.png`;

  if (isMobileGalleryTarget()) {
    try {
      const file = await dataUrlToPngFile(dataUrl, name);
      if (canSharePngFile(file)) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      // Any other failure falls through to the direct-download fallback.
    }
  }

  await downloadStrip(dataUrl, name);
}
