import type { FrameConfig } from "@/types/photobooth";
import {
  applyCanvasFill,
  getCaptionFillStyle,
  isGradientFill,
  isPatternFill,
} from "@/lib/frameFill";
import {
  clampStripCaption,
  getFittedStripCaptionFontSize,
} from "@/lib/stripCaption";

const EXPORT_WIDTH = 1200;

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

async function loadFrameSvg(frameColor: string, svgPath: string): Promise<HTMLImageElement> {
  const response = await fetch(svgPath);
  const svgText = await response.text();
  const coloredSvg = svgText.replace(/fill="black"/g, `fill="${frameColor}"`);
  const blob = new Blob([coloredSvg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function drawFrameOverlay(
  ctx: CanvasRenderingContext2D,
  frameColor: string,
  svgPath: string,
  width: number,
  height: number,
): Promise<void> {
  const mask = await loadFrameSvg("#000000", svgPath);

  if (
    !isPatternFill(frameColor) &&
    !isGradientFill(frameColor) &&
    frameColor.startsWith("#")
  ) {
    const colored = await loadFrameSvg(frameColor, svgPath);
    ctx.drawImage(colored, 0, 0, width, height);
    return;
  }

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

  await drawFrameOverlay(ctx, frameColor, frame.svgPath, stripWidth, stripHeight);

  if (captionText.trim()) {
    const caption = clampStripCaption(captionText).trim();
    const fontSize = getFittedStripCaptionFontSize(
      stripWidth,
      caption,
      frame.captionFontSizeScale ?? 1,
      (size) => {
      ctx.font = `${size}px Caveat, cursive`;
      return ctx.measureText(caption).width;
    },
    );
    ctx.fillStyle = getCaptionFillStyle(ctx, textColor, stripWidth);
    ctx.font = `${fontSize}px Caveat, cursive`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      caption,
      stripWidth / 2,
      frame.captionY * stripHeight,
    );
  }

  return canvas.toDataURL("image/png");
}

export function downloadStrip(dataUrl: string, filename?: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename ?? `photobooth-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function isMobileGalleryTarget(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

async function dataUrlToPngFile(
  dataUrl: string,
  filename: string,
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: "image/png" });
}

function canSharePngFile(file: File): boolean {
  if (typeof navigator.share !== "function") return false;
  return !navigator.canShare || navigator.canShare({ files: [file] });
}

/** Save strip to Photos/Gallery on mobile via the system share sheet. */
export async function saveStrip(
  dataUrl: string,
  filename?: string,
): Promise<void> {
  const name = filename ?? `photobooth-${Date.now()}.png`;

  if (isMobileGalleryTarget()) {
    const file = await dataUrlToPngFile(dataUrl, name);

    if (canSharePngFile(file)) {
      try {
        await navigator.share({
          files: [file],
          title: "Photobooth strip",
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }
  }

  downloadStrip(dataUrl, name);
}
