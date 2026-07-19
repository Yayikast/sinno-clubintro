export type PhotoboothStep = "landing" | "addPhoto" | "customize" | "print";

export type FrameId = "frame1" | "frame2" | "frame3" | "frame4" | "frame5";

export type PhotoMode = "take" | "upload";

export type CountdownSeconds = 3 | 5 | 10;

export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameConfig {
  id: FrameId;
  label: string;
  photoCount: number;
  cols: number;
  rows: number;
  aspectRatio: number;
  svgPath: string;
  iconPath: string;
  slots: PhotoSlot[];
  /** Normalized vertical anchor for caption (0–1). */
  captionY: number;
  /** Optional multiplier on default caption font size (wide layouts). */
  captionFontSizeScale?: number;
}

export interface ColorSwatch {
  id: string;
  label: string;
  value: string;
}

export interface PhotoboothState {
  step: PhotoboothStep;
  frame: FrameConfig | null;
  photos: (string | null)[];
  photoMode: PhotoMode;
  countdownSeconds: CountdownSeconds;
  frameColor: string;
  textColor: string;
  captionText: string;
  finalStripUrl: string | null;
  activeSlotIndex: number | null;
  isRetaking: boolean;
}

export type CameraErrorType =
  | "permission-denied"
  | "not-found"
  | "not-readable"
  | "not-supported"
  | "capture-failed"
  | "unknown";

export interface CameraError {
  type: CameraErrorType;
  message: string;
}

export function createEmptyPhotos(count: number): (string | null)[] {
  return Array.from({ length: count }, () => null);
}
