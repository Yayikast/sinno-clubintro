import type { FrameConfig } from "@/types/photobooth";

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

  ctx.fillStyle = frameColor;
  ctx.fillRect(0, 0, stripWidth, stripHeight);

  const images = await Promise.all(photos.map((photo) => loadImage(photo)));

  images.forEach((image, index) => {
    const slot = frame.slots[index];
    if (!slot) return;

    const x = slot.x * stripWidth;
    const y = slot.y * stripHeight;
    const width = slot.width * stripWidth;
    const height = slot.height * stripHeight;

    drawCoverImage(ctx, image, x, y, width, height);
  });

  const frameOverlay = await loadFrameSvg(frameColor, frame.svgPath);
  ctx.drawImage(frameOverlay, 0, 0, stripWidth, stripHeight);

  if (captionText.trim()) {
    const fontSize = Math.round(stripWidth * 0.045);
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px Caveat, cursive`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      captionText,
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
