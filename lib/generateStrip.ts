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

/** Which Instagram-share background to use for each frame layout (per product spec). */
const SHARE_NARROW_FRAMES = new Set(["frame1", "frame2", "frame3"]);

function getShareBackgroundPath(frame: FrameConfig): string {
  return SHARE_NARROW_FRAMES.has(frame.id)
    ? theme.assets.shareBackgroundNarrow
    : theme.assets.shareBackgroundWide;
}

/** Instagram-share template dimensions (per product spec). */
const SHARE_TEMPLATE_WIDTH = 1080;
const SHARE_TEMPLATE_HEIGHT = 1920;
const SHARE_STRIP_HEIGHT = 1374;
const SHARE_STRIP_Y = 308;

/**
 * Composites the finished strip centered over the Instagram-share background
 * for this frame's layout (share1.jpg for frame1-3, share2.jpg for frame4-5).
 * Canvas and strip sizing are fixed per spec, independent of the source
 * assets' native resolution.
 */
export async function generateShareImage(
  finalStripUrl: string,
  frame: FrameConfig,
): Promise<string> {
  const [background, strip] = await Promise.all([
    loadCachedImage(getShareBackgroundPath(frame)),
    loadImage(finalStripUrl),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = SHARE_TEMPLATE_WIDTH;
  canvas.height = SHARE_TEMPLATE_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const stripAspect = strip.naturalWidth / strip.naturalHeight;
  const drawHeight = SHARE_STRIP_HEIGHT;
  const drawWidth = drawHeight * stripAspect;

  ctx.drawImage(
    strip,
    (canvas.width - drawWidth) / 2,
    SHARE_STRIP_Y,
    drawWidth,
    drawHeight,
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

async function dataUrlToFile(
  dataUrl: string,
  filename: string,
  mimeType: string,
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType });
}

/** The Save file: the strip on its own, as a PNG. */
export function createStripFile(finalStripUrl: string): Promise<File> {
  return dataUrlToFile(finalStripUrl, `${downloadPrefix}-${Date.now()}.png`, "image/png");
}

/** The Share file: the strip on the Instagram template, as a JPEG. */
export async function createShareFile(
  finalStripUrl: string,
  frame: FrameConfig,
): Promise<File> {
  const shareImageUrl = await generateShareImage(finalStripUrl, frame);
  return dataUrlToFile(shareImageUrl, `${downloadPrefix}-share-${Date.now()}.jpg`, "image/jpeg");
}

/**
 * Downloads via a short-lived Blob URL rather than a data: URI in the anchor
 * href — large data: URIs are known to silently fail to navigate on some
 * mobile browsers, whereas Blob URLs are a short opaque reference.
 */
function downloadFile(file: File): void {
  const objectUrl = URL.createObjectURL(file);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = file.name;
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

function canShareFile(file: File): boolean {
  if (typeof navigator.share !== "function") return false;
  return !navigator.canShare || navigator.canShare({ files: [file] });
}

/**
 * On phones, opens the OS share sheet (where people pick "Save Image" or
 * Instagram — a website can't open a specific app itself). Everywhere else,
 * or if sharing fails, downloads the file instead.
 *
 * navigator.share() is called before anything is awaited: browsers only allow
 * it shortly after a tap, so the file should be built ahead of time (see
 * createStripFile / createShareFile) rather than after the tap.
 */
export async function shareOrDownloadFile(file: File): Promise<void> {
  if (isMobileGalleryTarget() && canShareFile(file)) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (error) {
      // The person closed the sheet, or a share is already open — either
      // way, don't also start a download.
      if (
        error instanceof DOMException &&
        (error.name === "AbortError" || error.name === "InvalidStateError")
      ) {
        return;
      }
      // Anything else (unsupported, not allowed) falls back to a download.
    }
  }

  downloadFile(file);
}
