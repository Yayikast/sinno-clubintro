"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { SlotPhoto } from "@/components/ui/SlotPhoto";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { theme, getAddPhotoThumbnailSizes, getUploadPreviewSize } from "@/themes";
import { trackPhotobooth } from "@/lib/analytics";
import {
  cropPhotoToSlot,
  fileToPhotoDataUrl,
} from "@/lib/photoDisplay";
import {
  CountdownPicker,
  ActionFooter,
  ModeTabs,
  PageContent,
  PageShell,
  PinkButton,
} from "@/components/ui/PageShell";
import { FramePreview } from "@/components/ui/FramePreview";
import { Countdown } from "@/components/camera/Countdown";
import { CameraFlash } from "@/components/camera/CameraFlash";
import { useCountdown } from "@/hooks/useCountdown";
import { useViewportLayout } from "@/hooks/useViewportLayout";
import { useIsLandscape } from "@/hooks/useIsLandscape";
import { LandscapeShell } from "@/components/ui/LandscapeShell";
import { scaleBoxToFit } from "@/lib/responsiveLayout";
import { useCamera, getVideoConstraints } from "@/hooks/useCamera";
import { CAPTURE_JPEG_QUALITY, type CameraFacingMode } from "@/lib/cameraCapture";
import { playShutterSound, unlockShutterSound } from "@/lib/shutterSound";

/** How long to wait for a just-switched camera before giving up on a shot. */
const CAMERA_READY_TIMEOUT_MS = 4000;

function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function waitUntil(condition: () => boolean, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const check = () => {
      if (condition() || performance.now() - startedAt >= timeoutMs) {
        resolve();
        return;
      }
      window.setTimeout(check, 100);
    };
    check();
  });
}

interface LiveTrackInfo {
  deviceId?: string;
  facing?: CameraFacingMode;
}

/**
 * Whether the camera that's actually streaming is a front/selfie camera
 * (those get mirrored). Prefers the facing direction the browser reports for
 * the live track — language-independent, unlike labels, which iOS translates —
 * then English labels, then "first camera in the list is the front one."
 */
function resolveIsFrontFacing(
  liveTrack: LiveTrackInfo | null,
  liveDeviceLabel: string,
  liveDeviceIndex: number,
  preferredFacing: CameraFacingMode,
): boolean {
  if (liveTrack?.facing) return liveTrack.facing === "user";
  if (/back|rear|environment/.test(liveDeviceLabel)) return false;
  if (/front|user|face|selfie/.test(liveDeviceLabel)) return true;
  if (liveTrack) return liveDeviceIndex <= 0;
  return preferredFacing === "user";
}

export function AddPhotoStep() {
  const {
    frame,
    photos,
    photoMode,
    countdownSeconds,
    activeSlotIndex,
    isRetaking,
    allPhotosFilled,
    captionText,
    setPhotoMode,
    setCountdownSeconds,
    setPhotoAtIndex,
    setActiveSlotIndex,
    setIsRetaking,
    goToStep,
    goBack,
  } = usePhotobooth();

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureSlotIndexRef = useRef(0);
  const captureQueueRef = useRef<number[]>([]);
  const startCountdownRef = useRef<() => void>(() => {});
  const cancelCountdownRef = useRef<() => void>(() => {});
  // Whether the camera should be on. The live preview starts as soon as the
  // Take Photos tab is showing — no "tap Snap to begin" step.
  const [sessionStarted, setSessionStarted] = useState(photoMode === "take");
  const [showFlash, setShowFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSessionActive, setCaptureSessionActive] = useState(false);
  const [batchCaptureMeta, setBatchCaptureMeta] = useState<{ pos: number; total: number } | null>(
    null,
  );
  const [hoverSlotIndex, setHoverSlotIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<{ index: number; message: string } | null>(
    null,
  );
  const [isConvertingUpload, setIsConvertingUpload] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  // The camera the user asked for. Phones switch by facing direction, so the
  // OS picks the main lens for that side (iPhones also expose ultra-wide,
  // telephoto, etc., which cycling through every device would land on).
  // Cameras that don't report a facing direction — most laptops — switch by
  // device id instead. Learning the device ids after permission is granted
  // deliberately does NOT change this, so the camera isn't reopened.
  const [preferredFacing, setPreferredFacing] = useState<CameraFacingMode>("user");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  // Bumped on every flip and retry so each camera request is uniquely
  // identifiable — see handleCameraError.
  const [cameraRequestId, setCameraRequestId] = useState(0);
  // What's actually streaming, read from the live track.
  const [liveTrack, setLiveTrack] = useState<LiveTrackInfo | null>(null);
  const facingSupportedRef = useRef<boolean | null>(null);
  // Device id we were on when a facing switch was requested (null = none pending).
  const pendingFacingSwitchFromRef = useRef<string | null>(null);
  const hasRetriedCameraRef = useRef(false);

  const refreshVideoDevices = useCallback(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setVideoDevices(devices.filter((device) => device.kind === "videoinput"));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshVideoDevices();
  }, [refreshVideoDevices]);

  const cameraKey = `${selectedDeviceId ?? `facing:${preferredFacing}`}#${cameraRequestId}`;
  const currentCameraKeyRef = useRef(cameraKey);
  useEffect(() => {
    currentCameraKeyRef.current = cameraKey;
  }, [cameraKey]);
  const videoDevicesRef = useRef(videoDevices);
  useEffect(() => {
    videoDevicesRef.current = videoDevices;
  }, [videoDevices]);

  const liveDeviceIndex = liveTrack?.deviceId
    ? videoDevices.findIndex((device) => device.deviceId === liveTrack.deviceId)
    : -1;
  const liveDeviceLabel = videoDevices[liveDeviceIndex]?.label.toLowerCase() ?? "";
  const isFrontFacing = resolveIsFrontFacing(
    liveTrack,
    liveDeviceLabel,
    liveDeviceIndex,
    preferredFacing,
  );

  const {
    isReady,
    error,
    activateCamera,
    capturePhoto,
    resetError,
    handleUserMedia: onCameraStreamReady,
    handleUserMediaError,
  } = useCamera({ webcamRef, initialActive: false, mirrored: isFrontFacing, cameraKey });

  const handleCameraStream = useCallback(
    (stream: MediaStream, requestKey: string) => {
      if (requestKey !== currentCameraKeyRef.current) return;

      hasRetriedCameraRef.current = false;
      onCameraStreamReady(stream);

      const settings = stream.getVideoTracks()[0]?.getSettings?.() ?? {};
      const facing =
        settings.facingMode === "user" || settings.facingMode === "environment"
          ? settings.facingMode
          : undefined;
      if (facingSupportedRef.current === null) {
        facingSupportedRef.current = Boolean(facing);
      }

      // A facing switch that came back on the same camera means this device
      // doesn't honor facing directions — fall back to switching by device id.
      const switchedFrom = pendingFacingSwitchFromRef.current;
      pendingFacingSwitchFromRef.current = null;
      if (switchedFrom && settings.deviceId === switchedFrom) {
        facingSupportedRef.current = false;
        const otherDeviceId = videoDevicesRef.current
          .map((device) => device.deviceId)
          .find((deviceId) => deviceId && deviceId !== switchedFrom);
        if (otherDeviceId) {
          setSelectedDeviceId(otherDeviceId);
          setCameraRequestId((id) => id + 1);
        }
      }

      setLiveTrack({ deviceId: settings.deviceId, facing });
      // Labels/ids are blank until permission is granted; refresh now that it is.
      refreshVideoDevices();
    },
    [onCameraStreamReady, refreshVideoDevices],
  );

  const handleCameraError = useCallback(
    (mediaError: string | DOMException, requestKey: string) => {
      // react-webcam still reports errors from a request that was superseded
      // (the user flipped while it was starting). Ignore those — otherwise a
      // late failure from the old camera tears down the new, working one.
      if (requestKey !== currentCameraKeyRef.current) return;

      const name = mediaError instanceof DOMException ? mediaError.name : "";
      const cameraStillBusy =
        name === "NotReadableError" || name === "AbortError" || name === "TrackStartError";
      if (cameraStillBusy && !hasRetriedCameraRef.current) {
        // Phones often haven't released the previous camera yet right after a
        // switch. Retry once after a moment before showing an error.
        hasRetriedCameraRef.current = true;
        window.setTimeout(() => setCameraRequestId((id) => id + 1), 600);
        return;
      }

      // The camera couldn't start — stop the countdown/batch instead of
      // counting down over the error and "capturing" from no camera.
      cancelCountdownRef.current();
      captureQueueRef.current = [];
      setBatchCaptureMeta(null);
      setCaptureSessionActive(false);
      handleUserMediaError(mediaError);
    },
    [handleUserMediaError],
  );

  const handleFlipCamera = () => {
    if (captureSessionActive || isCapturing) return;
    hasRetriedCameraRef.current = false;
    // Let the flip button also recover from a camera error ("Try switching cameras").
    if (error && error.type !== "capture-failed") {
      resetError();
    }

    if (facingSupportedRef.current === false) {
      const deviceIds = videoDevices.map((device) => device.deviceId).filter(Boolean);
      if (deviceIds.length < 2) return;
      const currentId = liveTrack?.deviceId ?? selectedDeviceId;
      const currentIndex = currentId ? deviceIds.indexOf(currentId) : -1;
      setSelectedDeviceId(deviceIds[(currentIndex + 1) % deviceIds.length]);
    } else {
      pendingFacingSwitchFromRef.current = liveTrack?.deviceId ?? null;
      setSelectedDeviceId(null);
      setPreferredFacing((facing) => (facing === "user" ? "environment" : "user"));
    }
    setCameraRequestId((id) => id + 1);
  };

  const { contentWidth, contentHeight } = useViewportLayout({ hasFooter: true });
  const addPhotoLayout = theme.layout.addPhoto;
  const captureWidth = Math.min(addPhotoLayout.viewfinder.width, contentWidth);
  const captureHeight =
    (captureWidth / addPhotoLayout.viewfinder.width) *
    addPhotoLayout.viewfinder.height;
  const viewfinderDimensions = scaleBoxToFit(
    captureWidth,
    captureHeight,
    captureWidth,
    Math.max(180, contentHeight * 0.42),
  );

  const isLandscape = useIsLandscape();
  const uploadPreviewSize = getUploadPreviewSize(frame.aspectRatio);
  const uploadLayout = addPhotoLayout.upload;
  const takeSpacing = addPhotoLayout.takePhoto;
  const addPhotoCopy = theme.copy.addPhoto;
  const uploadWidthLimited = Math.min(uploadPreviewSize.width, contentWidth);
  const uploadHeightFromWidth =
    (uploadWidthLimited / uploadPreviewSize.width) * uploadPreviewSize.height;
  const uploadPreviewDimensions = scaleBoxToFit(
    uploadWidthLimited,
    uploadHeightFromWidth,
    contentWidth,
    Math.max(180, contentHeight * 0.55),
  );

  // The shot is taken asynchronously (after waiting for the camera), so read
  // the latest readiness/capture function rather than a stale closure.
  const isReadyRef = useRef(isReady);
  useEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);
  const capturePhotoRef = useRef(capturePhoto);
  useEffect(() => {
    capturePhotoRef.current = capturePhoto;
  }, [capturePhoto]);

  const performCapture = useCallback(() => {
    const slotIndex = captureSlotIndexRef.current;
    const slot = frame.slots[slotIndex];
    if (!slot) {
      captureQueueRef.current = [];
      setBatchCaptureMeta(null);
      setCaptureSessionActive(false);
      return;
    }

    setIsCapturing(true);

    void (async () => {
      // If the camera was just flipped (e.g. mid-countdown), give the new
      // stream a moment to come up instead of failing the whole batch.
      const isCancelled = () => !captureQueueRef.current.includes(slotIndex);
      await waitUntil(
        () =>
          isCancelled() ||
          (isReadyRef.current && (webcamRef.current?.video?.videoWidth ?? 0) > 0),
        CAMERA_READY_TIMEOUT_MS,
      );
      // The camera failed (or the mode changed) while we waited — drop the shot.
      if (isCancelled()) {
        setIsCapturing(false);
        return;
      }

      setShowFlash(true);
      playShutterSound();
      await waitFor(theme.motion.captureDelayMs);

      const screenshot = capturePhotoRef.current();
      setShowFlash(false);

      if (!screenshot) {
        setIsCapturing(false);
        captureQueueRef.current = [];
        setBatchCaptureMeta(null);
        setCaptureSessionActive(false);
        return;
      }

      try {
        const cropped = await cropPhotoToSlot(screenshot, slot, frame.aspectRatio);
        setPhotoAtIndex(slotIndex, cropped);
      } catch {
        setPhotoAtIndex(slotIndex, screenshot);
      } finally {
        setIsCapturing(false);
      }

      const queue = captureQueueRef.current;
      const queueIndex = queue.indexOf(slotIndex);
      if (queueIndex >= 0 && queueIndex < queue.length - 1) {
        const nextSlot = queue[queueIndex + 1];
        captureSlotIndexRef.current = nextSlot;
        setBatchCaptureMeta({ pos: queueIndex + 2, total: queue.length });
        window.setTimeout(() => startCountdownRef.current(), theme.motion.batchCaptureDelayMs);
        return;
      }

      captureQueueRef.current = [];
      setBatchCaptureMeta(null);
      setCaptureSessionActive(false);
      setActiveSlotIndex(null);
      setIsRetaking(false);
    })();
  }, [
    frame.aspectRatio,
    frame.slots,
    setActiveSlotIndex,
    setIsRetaking,
    setPhotoAtIndex,
  ]);

  const { count, isCountingDown, start: startCountdown, cancel: cancelCountdown } =
    useCountdown({
      duration: countdownSeconds,
      onComplete: performCapture,
    });

  useEffect(() => {
    startCountdownRef.current = startCountdown;
    cancelCountdownRef.current = cancelCountdown;
  }, [startCountdown, cancelCountdown]);

  const beginCaptureQueue = (queue: number[]) => {
    if (queue.length === 0) return;

    captureQueueRef.current = queue;
    captureSlotIndexRef.current = queue[0];
    setBatchCaptureMeta({ pos: 1, total: queue.length });
    setCaptureSessionActive(true);
    setActiveSlotIndex(null);
    setIsRetaking(false);

    if (!sessionStarted) {
      activateCamera();
      setSessionStarted(true);
    }

    startCountdown();
  };

  const handleCaptureClick = () => {
    if (isCapturing || isCountingDown || showFlash || captureSessionActive) return;
    // No camera (e.g. permission denied) — don't count down over the error.
    if (error && error.type !== "capture-failed") return;
    unlockShutterSound();

    if (error?.type === "capture-failed") {
      resetError();
    }

    const emptyIndices = photos.reduce<number[]>((indices, photo, index) => {
      if (photo === null) {
        indices.push(index);
      }
      return indices;
    }, []);

    beginCaptureQueue(emptyIndices);
  };

  const handleThumbnailClick = (index: number) => {
    if (photoMode !== "take") return;
    if (!photos[index]) return;
    if (isCapturing || showFlash || captureSessionActive) return;
    if (error && error.type !== "capture-failed") return;
    unlockShutterSound();

    if (error?.type === "capture-failed") {
      resetError();
    }

    if (isCountingDown) {
      cancelCountdown();
    }

    setActiveSlotIndex(index);
    setIsRetaking(true);
    beginCaptureQueue([index]);
  };

  const handleUploadSlotClick = (index: number) => {
    setUploadError(null);
    setActiveSlotIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || activeSlotIndex === null) return;

    const slotIndex = activeSlotIndex;
    const slot = frame.slots[slotIndex];
    if (!slot) return;

    setUploadError(null);
    setIsConvertingUpload(true);

    void fileToPhotoDataUrl(file)
      .then((dataUrl) => cropPhotoToSlot(dataUrl, slot, frame.aspectRatio))
      .then((cropped) => {
        setPhotoAtIndex(slotIndex, cropped);
        const nextPhotos = photos.map((photo, index) =>
          index === slotIndex ? cropped : photo,
        );
        const nextEmpty = nextPhotos.findIndex((photo) => photo === null);
        setActiveSlotIndex(nextEmpty === -1 ? null : nextEmpty);
      })
      .catch(() => {
        // The image couldn't be read/converted/decoded — leave the slot
        // empty and tell the user, rather than silently "filling" it with
        // a broken image that can't be replaced by re-selecting the slot.
        setUploadError({
          index: slotIndex,
          message: addPhotoCopy.uploadFailed,
        });
        setPhotoAtIndex(slotIndex, null);
        setActiveSlotIndex(slotIndex);
      })
      .finally(() => {
        setIsConvertingUpload(false);
      });
  };

  const handleModeChange = (mode: "take" | "upload") => {
    setUploadError(null);
    // Must run first: it clears the active slot, which the upload branch below
    // then sets to the next empty slot.
    setPhotoMode(mode);
    if (mode === "upload") {
      cancelCountdown();
      captureQueueRef.current = [];
      setBatchCaptureMeta(null);
      setCaptureSessionActive(false);
      setSessionStarted(false);
      setIsRetaking(false);
      const nextEmpty = photos.findIndex((photo) => photo === null);
      setActiveSlotIndex(nextEmpty === -1 ? null : nextEmpty);
    } else {
      setActiveSlotIndex(null);
      setSessionStarted(true);
    }
  };

  const isCaptureError = error?.type === "capture-failed";
  const showCamera = photoMode === "take" && sessionStarted && (!error || isCaptureError);
  const showCameraPlaceholder =
    photoMode === "take" && (!sessionStarted || !isReady) && !error;

  const takeStatusHint =
    error && !isCaptureError && !allPhotosFilled
      ? addPhotoCopy.cameraUnavailableHint
      : isCountingDown || isCapturing || captureSessionActive
      ? batchCaptureMeta && batchCaptureMeta.total > 1
        ? addPhotoCopy.capturingPhotoOf(batchCaptureMeta.pos, batchCaptureMeta.total)
        : addPhotoCopy.capturingMoments
      : allPhotosFilled
        ? (
            <>
              {addPhotoCopy.selectPhotoToRetake.split("\n")[0]}
              <br />
              {addPhotoCopy.selectPhotoToRetake.split("\n")[1]}
            </>
          )
        : isRetaking
          ? addPhotoCopy.retakingPhoto((activeSlotIndex ?? 0) + 1)
          : batchCaptureMeta
            ? addPhotoCopy.photoOf(batchCaptureMeta.pos, batchCaptureMeta.total)
            : addPhotoCopy.photosTapCapture(frame.photoCount);

  const footer = allPhotosFilled ? (
    <ActionFooter hint={photoMode === "take" ? takeStatusHint : undefined}>
      <PinkButton
        onClick={() => {
          trackPhotobooth("photobooth_photos_completed", {
            frameId: frame.id,
            mode: photoMode,
          });
          goToStep("customize");
        }}
      >
        {addPhotoCopy.nextButton}
      </PinkButton>
    </ActionFooter>
  ) : photoMode === "take" ? (
    <ActionFooter hint={takeStatusHint}>
      <PinkButton
        onClick={handleCaptureClick}
        disabled={
          isCapturing || isCountingDown || captureSessionActive || (!!error && !isCaptureError)
        }
      >
        <Image src={theme.assets.cameraBlack} alt="" width={16} height={16} />
        {addPhotoCopy.captureButton}
      </PinkButton>
    </ActionFooter>
  ) : null;

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*,.heic,.heif"
      className="hidden"
      onChange={handleFileChange}
    />
  );

  const modeTabs = <ModeTabs mode={photoMode} onChange={handleModeChange} />;

  const countdownPicker = (
    <CountdownPicker value={countdownSeconds} onChange={setCountdownSeconds} />
  );

  const uploadHint = (
    <p
      className="font-mono text-center text-xs"
      style={{ color: uploadError ? "#B00020" : "#000000" }}
    >
      {uploadError
        ? uploadError.message
        : isConvertingUpload
          ? addPhotoCopy.convertingPhoto
          : addPhotoCopy.uploadHint}
    </p>
  );

  const renderUploadPreview = (size: { width: number; height: number }) => (
    <FramePreview
      frame={frame}
      photos={photos}
      width={size.width}
      height={size.height}
      captionText={captionText}
      showPlaceholders
      placeholderBg={uploadLayout.placeholderBg}
      overlayBg={uploadLayout.overlayBg}
      onSlotClick={handleUploadSlotClick}
      activeSlotIndex={activeSlotIndex}
    />
  );

  const renderThumbnails = (rowWidth: number) => {
    const thumbnailSizes = getAddPhotoThumbnailSizes(frame.id, rowWidth, true);

    return (
      <div
    // The slot the next Snap fills — slots fill in order, so it's the first empty one.
    const nextSlotIndex = isRetaking ? activeSlotIndex : photos.findIndex((p) => p === null);
        className="flex w-full min-w-0 items-center justify-center overflow-hidden"
        style={{
          gap: addPhotoLayout.thumbnail.gap,
          maxWidth: rowWidth,
          maxHeight: addPhotoLayout.thumbnail.maxRowHeight,
        }}
      >
        {photos.map((photo, index) => {
          const slot = frame.slots[index];
          const size = thumbnailSizes[index];
          if (!slot || !size) return null;

          return (
            <div
              key={index}
              className="shrink-0"
              onMouseEnter={() => photo && setHoverSlotIndex(index)}
              onMouseLeave={() => setHoverSlotIndex(null)}
            >
              <SlotPhoto
                photo={photo}
                slot={slot}
                frameAspectRatio={frame.aspectRatio}
                height={size.height}
                width={size.width}
                className={photo ? "cursor-pointer" : undefined}
                onClick={
                  photo && !isCapturing && !showFlash && !captureSessionActive
                    ? () => handleThumbnailClick(index)
                    : undefined
                }
                overlay={
                  photo &&
                  (hoverSlotIndex === index || (isRetaking && activeSlotIndex === index)) ? (
                    <div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.overlay }}
                    >
                      <Image src={theme.assets.cameraWhite} alt="" width={20} height={20} />
                    </div>
                  ) : undefined
                }
              />
                  ) : !photo ? (
                    <div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-sm font-mono text-xs"
                      style={
                        index === nextSlotIndex
                          ? {
                              border: `2px solid ${theme.colors.button.primaryHover}`,
                              color: "#FFFFFF",
                            }
                          : { color: "rgba(255, 255, 255, 0.35)" }
                      }
                    >
                      {index + 1}
                    </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderViewfinder = (size: { width: number; height: number }) => (
              <div
                className="relative overflow-hidden rounded-lg"
                style={{
                  width: size.width,
                  maxWidth: "100%",
                  height: size.height,
                  backgroundColor: addPhotoLayout.viewfinder.background,
                }}
              >
                {showCamera ? (
                  <Webcam
                    key={cameraKey}
                    ref={webcamRef}
                    audio={false}
                    mirrored={isFrontFacing}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={CAPTURE_JPEG_QUALITY}
                    videoConstraints={
                      selectedDeviceId
                        ? {
                            deviceId: { exact: selectedDeviceId },
                            width: { ideal: 1920 },
                            height: { ideal: 2560 },
                          }
                        : getVideoConstraints(preferredFacing)
                    }
                    // Each callback is tagged with the request it belongs to,
                    // so results from a superseded request can be ignored.
                    onUserMedia={(stream) => handleCameraStream(stream, cameraKey)}
                    onUserMediaError={(mediaError) => handleCameraError(mediaError, cameraKey)}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : showCameraPlaceholder ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="font-mono text-sm text-white/60">
                      {addPhotoCopy.cameraStarting}
                    </p>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleFlipCamera}
                  // Locked from tapping Snap until the last photo of the batch
                  // is saved — switching cameras mid-sequence restarts the
                  // stream between shots. Free before starting and afterwards
                  // (e.g. to switch cameras for a retake).
                  disabled={captureSessionActive || isCountingDown || isCapturing}
                  aria-label={addPhotoCopy.flipCameraAriaLabel}
                  // z-10 keeps it above the error overlay, whose message
                  // tells people to "Try switching cameras".
                  className="absolute right-2 top-2 z-10 flex h-9 aspect-square items-center justify-center rounded-full bg-black/40 disabled:opacity-40"
                >
                  <Image src={theme.assets.cameraFlipWhite} alt="" width={18} height={18} />
                </button>

                {error && !isCaptureError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-4 text-center">
                    <p className="font-mono text-sm text-white">{error.message}</p>
                    <PinkButton
                      onClick={() => {
                        resetError();
                        activateCamera();
                        setSessionStarted(true);
                      }}
                      width={120}
                    >
                      {addPhotoCopy.tryAgainButton}
                    </PinkButton>
                  </div>
                ) : null}

                {isCaptureError ? (
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-center">
                    <p className="font-mono text-xs text-white">{error.message}</p>
                  </div>
                ) : null}

                {isCountingDown && count !== null && count > 0 ? (
                  <Countdown count={count} />
                ) : null}

                <CameraFlash show={showFlash} />
              </div>
  );

  if (isLandscape) {
    return (
      <>
        {fileInput}
        <LandscapeShell
          showBack
          onBack={goBack}
          media={(size) =>
            photoMode === "take"
              ? renderViewfinder(
                  scaleBoxToFit(
                    addPhotoLayout.viewfinder.width,
                    addPhotoLayout.viewfinder.height,
                    size.width,
                    size.height,
                  ),
                )
              : renderUploadPreview(
                  scaleBoxToFit(
                    uploadPreviewSize.width,
                    uploadPreviewSize.height,
                    size.width,
                    size.height,
                  ),
                )
          }
          controls={(controlsWidth) => (
            <div className="flex flex-1 flex-col justify-center gap-4">
              {modeTabs}
              {photoMode === "take" ? (
                <>
                  {countdownPicker}
                  {renderThumbnails(controlsWidth)}
                </>
              ) : (
                uploadHint
              )}
            </div>
          )}
          footer={footer}
        />
      </>
    );
  }

  return (
    <PageShell showBack onBack={goBack} footer={footer}>
      {fileInput}

      <PageContent
        className="min-h-0 w-full min-w-0 flex-1"
        style={{ marginTop: addPhotoLayout.headerToTabsGap }}
      >
        {modeTabs}

        {photoMode === "take" ? (
          <>
            <div style={{ marginTop: takeSpacing.tabsToCountdownGap }}>{countdownPicker}</div>

            <div
              className="mx-auto flex w-full min-w-0 max-w-full flex-col items-center"
              style={{
                width: viewfinderDimensions.width,
                maxWidth: "100%",
                marginTop: takeSpacing.countdownToCaptureGap,
                gap: takeSpacing.viewfinderToThumbnailsGap,
              }}
            >
              {renderViewfinder(viewfinderDimensions)}
              {renderThumbnails(viewfinderDimensions.width)}
            </div>
          </>
        ) : (
          <div
            className="flex min-h-0 w-full flex-1 flex-col items-center justify-center"
            style={{ marginTop: uploadLayout.tabsToPreviewGap }}
          >
            {renderUploadPreview(uploadPreviewDimensions)}
            <div style={{ marginTop: uploadLayout.previewToHintGap }}>{uploadHint}</div>
          </div>
        )}
      </PageContent>
    </PageShell>
  );
}
