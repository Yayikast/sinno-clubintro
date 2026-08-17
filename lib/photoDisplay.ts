import type { PhotoSlot } from "@/types/photobooth";
import { CAPTURE_JPEG_QUALITY } from "@/lib/cameraCapture";

/**
 * Design system: captured/uploaded photos must NEVER be stretched or squeezed.
 * Always preserve aspect ratio and crop with cover semantics (center crop).
 *
 * Slot x/width are normalized to strip width; y/height to strip height — multiply
 * by frame aspect ratio to get true pixel width ÷ height.
 */

/** Width ÷ height in pixels for a frame slot. */
export function getSlotAspectRatio(
  slot: PhotoSlot,
  frameAspectRatio: number,
): number {
  return (slot.width / slot.height) * frameAspectRatio;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

/**
 * Center-crops an image to the target aspect ratio without distortion.
 */
export async function cropPhotoToAspectRatio(
  dataUrl: string,
  aspectRatio: number,
): Promise<string> {
  const image = await loadImage(dataUrl);
  const imageAspect = image.width / image.height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.width;
  let sourceHeight = image.height;

  if (imageAspect > aspectRatio) {
    sourceWidth = image.height * aspectRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else if (imageAspect < aspectRatio) {
    sourceHeight = image.width / aspectRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sourceWidth);
  canvas.height = Math.round(sourceHeight);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return canvas.toDataURL("image/jpeg", CAPTURE_JPEG_QUALITY);
}

export async function cropPhotoToSlot(
  dataUrl: string,
  slot: PhotoSlot,
  frameAspectRatio: number,
): Promise<string> {
  return cropPhotoToAspectRatio(
    dataUrl,
    getSlotAspectRatio(slot, frameAspectRatio),
  );
}

const HEIC_EXTENSION_PATTERN = /\.(heic|heif)$/i;

/** True for HEIC/HEIF files — no mainstream browser can decode these via <img>/canvas. */
export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    HEIC_EXTENSION_PATTERN.test(file.name)
  );
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Converts a HEIC/HEIF file to a JPEG data URL. Lazy-loads the ~2MB wasm decoder on first use. */
async function convertHeicToDataUrl(file: File): Promise<string> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  const jpegBlob = Array.isArray(result) ? result[0] : result;
  return readFileAsDataUrl(jpegBlob);
}

/**
 * Reads any uploaded image file as a data URL, converting HEIC/HEIF to JPEG
 * first since browsers can't decode HEIC via the Image/Canvas APIs used by
 * cropPhotoToSlot.
 */
export async function fileToPhotoDataUrl(file: File): Promise<string> {
  if (isHeicFile(file)) {
    return convertHeicToDataUrl(file);
  }
  return readFileAsDataUrl(file);
}
