export const CAPTURE_JPEG_QUALITY = 0.95;

/** Initial getUserMedia request — boosted further after stream starts when supported. */
export const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: "user",
  width: { ideal: 1920 },
  height: { ideal: 2560 },
};

/** Raise the active camera track to its maximum supported resolution. */
export async function boostCameraResolution(stream: MediaStream): Promise<void> {
  const track = stream.getVideoTracks()[0];
  if (!track?.getCapabilities) return;

  const capabilities = track.getCapabilities();
  const maxWidth = capabilities.width?.max;
  const maxHeight = capabilities.height?.max;
  if (!maxWidth || !maxHeight) return;

  try {
    await track.applyConstraints({
      width: { ideal: maxWidth },
      height: { ideal: maxHeight },
    });
  } catch {
    // Keep the stream at whatever resolution the device already granted.
  }
}

/** Capture a JPEG from the live video track at native stream resolution. */
export function captureVideoFrame(
  video: HTMLVideoElement,
  options: { mirrored?: boolean; quality?: number } = {},
): string | null {
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  if (!videoWidth || !videoHeight) return null;

  const canvas = document.createElement("canvas");
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const mirrored = options.mirrored ?? true;
  if (mirrored) {
    ctx.translate(videoWidth, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
  return canvas.toDataURL("image/jpeg", options.quality ?? CAPTURE_JPEG_QUALITY);
}
