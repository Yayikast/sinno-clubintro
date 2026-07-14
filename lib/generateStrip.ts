import { getAspectRatioValue } from "@/lib/layouts";
import type { LayoutConfig } from "@/types/photobooth";

const STRIP_WIDTH = 1200;
const PADDING_RATIO = 0.04;
const GAP_RATIO = 0.02;

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

export async function generateStrip(
  photos: string[],
  layout: LayoutConfig,
  frameColor: string,
): Promise<string> {
  const aspectRatio = getAspectRatioValue(layout.aspectRatio);
  const stripWidth = STRIP_WIDTH;
  const stripHeight = Math.round(stripWidth / aspectRatio);
  const padding = Math.round(stripWidth * PADDING_RATIO);
  const gap = Math.round(stripWidth * GAP_RATIO);

  const canvas = document.createElement("canvas");
  canvas.width = stripWidth;
  canvas.height = stripHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.fillStyle = frameColor;
  ctx.fillRect(0, 0, stripWidth, stripHeight);

  const contentWidth = stripWidth - padding * 2;
  const contentHeight = stripHeight - padding * 2;
  const slotWidth =
    (contentWidth - gap * (layout.cols - 1)) / layout.cols;
  const slotHeight =
    (contentHeight - gap * (layout.rows - 1)) / layout.rows;

  const images = await Promise.all(photos.map((photo) => loadImage(photo)));

  images.forEach((image, index) => {
    const col = index % layout.cols;
    const row = Math.floor(index / layout.cols);
    const x = padding + col * (slotWidth + gap);
    const y = padding + row * (slotHeight + gap);

    drawCoverImage(ctx, image, x, y, slotWidth, slotHeight);
  });

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
