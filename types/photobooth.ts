export type LayoutId = "vertical-3" | "vertical-4" | "grid-4";

export type AspectRatio = "6:2" | "6:5";

export type Arrangement = "vertical" | "grid-2x2";

export type PhotoboothStep =
  | "layout"
  | "capture"
  | "review"
  | "confirmPhotos"
  | "frameColor"
  | "confirmFrame"
  | "download";

export type CountdownSeconds = 3 | 5 | 10;

export interface LayoutConfig {
  id: LayoutId;
  label: string;
  description: string;
  aspectRatio: AspectRatio;
  photoCount: 3 | 4;
  arrangement: Arrangement;
  cols: number;
  rows: number;
}

export interface FrameColorOption {
  id: string;
  label: string;
  value: string;
}

export interface PhotoboothState {
  step: PhotoboothStep;
  layout: LayoutConfig | null;
  photos: (string | null)[];
  countdownSeconds: CountdownSeconds;
  frameColor: string;
  finalStripUrl: string | null;
  retakeIndex: number | null;
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

export type CameraSessionState =
  | "idle"
  | "requesting"
  | "active"
  | "error";

export function createEmptyPhotos(count: number): (string | null)[] {
  return Array.from({ length: count }, () => null);
}
