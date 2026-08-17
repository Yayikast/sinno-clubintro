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
import { scaleBoxToFit } from "@/lib/responsiveLayout";
import { useCamera, getVideoConstraints } from "@/hooks/useCamera";
import { CAPTURE_JPEG_QUALITY } from "@/lib/cameraCapture";
import { playShutterSound } from "@/lib/shutterSound";

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
  const [sessionStarted, setSessionStarted] = useState(false);
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
  const [deviceIndex, setDeviceIndex] = useState(0);

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

  const activeDevice = videoDevices[deviceIndex];
  const activeDeviceLabel = activeDevice?.label.toLowerCase() ?? "";
  // Device labels are only populated once permission is granted; before that
  // (or if the label is uninformative, e.g. "Integrated Camera") fall back to
  // assuming the first enumerated camera is the front/selfie one — true on
  // the overwhelming majority of laptops and phones.
  const isFrontFacing = /back|rear|environment/.test(activeDeviceLabel)
    ? false
    : /front|user|face|selfie/.test(activeDeviceLabel)
      ? true
      : deviceIndex === 0;
  const cameraKey = activeDevice?.deviceId || "default";

  const {
    isReady,
    error,
    activateCamera,
    capturePhoto,
    resetError,
    handleUserMedia: onCameraStreamReady,
    handleUserMediaError,
  } = useCamera({ webcamRef, initialActive: false, mirrored: isFrontFacing, cameraKey });

  const handleUserMedia = useCallback(
    (stream: MediaStream) => {
      onCameraStreamReady(stream);
      // Labels are blank until permission is granted; re-enumerate now that
      // it has been, so the front/back heuristic above can use real labels.
      refreshVideoDevices();
    },
    [onCameraStreamReady, refreshVideoDevices],
  );

  const handleFlipCamera = () => {
    setDeviceIndex((index) =>
      videoDevices.length > 0 ? (index + 1) % videoDevices.length : index,
    );
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

  const thumbnailSizes = getAddPhotoThumbnailSizes(
    frame.id,
    viewfinderDimensions.width,
    true,
  );
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
    setShowFlash(true);
    playShutterSound();

    window.setTimeout(() => {
      void (async () => {
        const screenshot = capturePhoto();
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
    }, theme.motion.captureDelayMs);
  }, [
    capturePhoto,
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
  }, [startCountdown]);

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
    }
    setPhotoMode(mode);
  };

  const isCaptureError = error?.type === "capture-failed";
  const showCamera = photoMode === "take" && sessionStarted && (!error || isCaptureError);
  const showCameraPlaceholder =
    photoMode === "take" && (!sessionStarted || !isReady) && !error;

  const takeStatusHint =
    isCountingDown || isCapturing || captureSessionActive
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

  return (
    <PageShell
      showBack
      onBack={goBack}
      footer={
        allPhotosFilled ? (
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
              disabled={isCapturing || isCountingDown || captureSessionActive}
            >
              <Image src={theme.assets.cameraBlack} alt="" width={16} height={16} />
              {addPhotoCopy.captureButton}
            </PinkButton>
          </ActionFooter>
        ) : null
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={handleFileChange}
      />

      <PageContent
        className={`w-full min-w-0 ${photoMode === "upload" || photoMode === "take" ? "min-h-0 flex-1" : ""}`}
        style={{ marginTop: addPhotoLayout.headerToTabsGap }}
      >
        <ModeTabs mode={photoMode} onChange={handleModeChange} />

        {photoMode === "take" ? (
          <>
            <div style={{ marginTop: takeSpacing.tabsToCountdownGap }}>
              <CountdownPicker
                value={countdownSeconds}
                onChange={setCountdownSeconds}
              />
            </div>

            <div
              className="mx-auto flex w-full min-w-0 max-w-full flex-col"
              style={{
                width: viewfinderDimensions.width,
                maxWidth: "100%",
                marginTop: takeSpacing.countdownToCaptureGap,
                gap: takeSpacing.viewfinderToThumbnailsGap,
              }}
            >
              <div
                className="relative w-full overflow-hidden rounded-lg"
                style={{
                  height: viewfinderDimensions.height,
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
                      // Before any camera permission has ever been granted to
                      // this origin, enumerateDevices() reports deviceId: ""
                      // for every device (Chrome/Firefox) — an exact "" match
                      // is unsatisfiable and throws OverconstrainedError, so
                      // only use deviceId selection once we have a real one.
                      activeDevice?.deviceId
                        ? {
                            deviceId: { exact: activeDevice.deviceId },
                            width: { ideal: 1920 },
                            height: { ideal: 2560 },
                          }
                        : getVideoConstraints("user")
                    }
                    onUserMedia={handleUserMedia}
                    onUserMediaError={handleUserMediaError}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : showCameraPlaceholder ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="font-mono text-sm text-white/60">
                      {sessionStarted
                        ? addPhotoCopy.cameraStarting
                        : addPhotoCopy.cameraTapToStart}
                    </p>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleFlipCamera}
                  disabled={isCapturing || isCountingDown || captureSessionActive}
                  aria-label={addPhotoCopy.flipCameraAriaLabel}
                  className="absolute right-2 top-2 flex h-9 aspect-square items-center justify-center rounded-full bg-black/40 disabled:opacity-40"
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

              <div
                className="flex w-full min-w-0 items-center justify-center overflow-hidden"
                style={{
                  gap: addPhotoLayout.thumbnail.gap,
                  maxWidth: viewfinderDimensions.width,
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
                          (hoverSlotIndex === index ||
                            (isRetaking && activeSlotIndex === index)) ? (
                            <div
                              className="pointer-events-none absolute inset-0 flex items-center justify-center"
                              style={{ backgroundColor: theme.colors.overlay }}
                            >
                              <Image
                                src={theme.assets.cameraWhite}
                                alt=""
                                width={20}
                                height={20}
                              />
                            </div>
                          ) : undefined
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div
            className="flex min-h-0 w-full flex-1 flex-col items-center justify-center"
            style={{ marginTop: uploadLayout.tabsToPreviewGap }}
          >
            <FramePreview
              frame={frame}
              photos={photos}
              width={uploadPreviewDimensions.width}
              height={uploadPreviewDimensions.height}
              captionText={captionText}
              showPlaceholders
              placeholderBg={uploadLayout.placeholderBg}
              overlayBg={uploadLayout.overlayBg}
              onSlotClick={handleUploadSlotClick}
              activeSlotIndex={activeSlotIndex}
            />

            <p
              className="font-mono text-center text-xs"
              style={{
                marginTop: uploadLayout.previewToHintGap,
                color: uploadError ? "#B00020" : "#000000",
              }}
            >
              {uploadError
                ? uploadError.message
                : isConvertingUpload
                  ? addPhotoCopy.convertingPhoto
                  : addPhotoCopy.uploadHint}
            </p>
          </div>
        )}
      </PageContent>
    </PageShell>
  );
}
