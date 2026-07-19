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
import { ADD_PHOTO_LAYOUT, getAddPhotoThumbnailRowWidth, getAddPhotoThumbnailSizes, getUploadPreviewSize } from "@/lib/addPhotoLayout";
import {
  cropPhotoToSlot,
} from "@/lib/photoDisplay";
import { scaleBoxToFit } from "@/lib/responsiveLayout";
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
import { useCamera, VIDEO_CONSTRAINTS } from "@/hooks/useCamera";
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

  const {
    isReady,
    error,
    activateCamera,
    capturePhoto,
    resetError,
    handleUserMedia,
    handleUserMediaError,
  } = useCamera({ webcamRef, initialActive: false });

  const { contentWidth, contentHeight } = useViewportLayout({ hasFooter: true });
  const captureColumnWidth = contentWidth;
  const captureViewfinderHeight = Math.min(
    (captureColumnWidth / ADD_PHOTO_LAYOUT.viewfinder.width) *
      ADD_PHOTO_LAYOUT.viewfinder.height,
    Math.max(180, contentHeight * 0.42),
  );

  const thumbnailSizes = getAddPhotoThumbnailSizes(frame.id, captureColumnWidth, true);
  const thumbnailRowWidth = getAddPhotoThumbnailRowWidth(thumbnailSizes);
  const thumbnailRowScrollable = thumbnailRowWidth > captureColumnWidth + 0.5;
  const uploadPreviewSize = getUploadPreviewSize(frame.aspectRatio);
  const uploadLayout = ADD_PHOTO_LAYOUT.upload;
  const takeSpacing = ADD_PHOTO_LAYOUT.takePhoto;
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
          window.setTimeout(() => startCountdownRef.current(), 600);
          return;
        }

        captureQueueRef.current = [];
        setBatchCaptureMeta(null);
        setCaptureSessionActive(false);
        setActiveSlotIndex(null);
        setIsRetaking(false);
      })();
    }, 150);
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

    if (isCountingDown) {
      cancelCountdown();
    }

    setActiveSlotIndex(index);
    setIsRetaking(true);
    beginCaptureQueue([index]);
  };

  const handleUploadSlotClick = (index: number) => {
    setActiveSlotIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || activeSlotIndex === null) return;

    const slotIndex = activeSlotIndex;
    const slot = frame.slots[slotIndex];
    if (!slot) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      void cropPhotoToSlot(reader.result, slot, frame.aspectRatio)
        .then((cropped) => {
          setPhotoAtIndex(slotIndex, cropped);
          const nextPhotos = photos.map((photo, index) =>
            index === slotIndex ? cropped : photo,
          );
          const nextEmpty = nextPhotos.findIndex((photo) => photo === null);
          setActiveSlotIndex(nextEmpty === -1 ? null : nextEmpty);
        })
        .catch(() => {
          setPhotoAtIndex(slotIndex, reader.result as string);
          const nextPhotos = photos.map((photo, index) =>
            index === slotIndex ? (reader.result as string) : photo,
          );
          const nextEmpty = nextPhotos.findIndex((photo) => photo === null);
          setActiveSlotIndex(nextEmpty === -1 ? null : nextEmpty);
        });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleModeChange = (mode: "take" | "upload") => {
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

  const showCamera = photoMode === "take" && sessionStarted && !error;
  const showCameraPlaceholder =
    photoMode === "take" && (!sessionStarted || !isReady) && !error;

  const takeStatusHint =
    isCountingDown || isCapturing || captureSessionActive
      ? batchCaptureMeta && batchCaptureMeta.total > 1
        ? `capturing photo ${batchCaptureMeta.pos} of ${batchCaptureMeta.total}...`
        : "capturing the moments..."
      : allPhotosFilled
        ? (
            <>
              select a photo to retake or
              <br />
              click next to choose your frame !
            </>
          )
        : isRetaking
          ? `retaking photo ${(activeSlotIndex ?? 0) + 1}...`
          : batchCaptureMeta
            ? `photo ${batchCaptureMeta.pos} of ${batchCaptureMeta.total}`
            : `${frame.photoCount} photos — tap capture to start`;

  return (
    <PageShell
      showBack
      onBack={goBack}
      footer={
        allPhotosFilled ? (
          <ActionFooter hint={photoMode === "take" ? takeStatusHint : undefined}>
            <PinkButton onClick={() => goToStep("customize")}>Next</PinkButton>
          </ActionFooter>
        ) : photoMode === "take" ? (
          <ActionFooter hint={takeStatusHint}>
            <PinkButton
              onClick={handleCaptureClick}
              disabled={isCapturing || isCountingDown || captureSessionActive}
            >
              <Image src="/figma/icons/camera-black.svg" alt="" width={16} height={16} />
              Capture
            </PinkButton>
          </ActionFooter>
        ) : null
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <PageContent
        className={`w-full min-w-0 ${photoMode === "upload" || photoMode === "take" ? "min-h-0 flex-1" : ""}`}
        style={{ marginTop: ADD_PHOTO_LAYOUT.headerToTabsGap }}
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
                width: captureColumnWidth,
                marginTop: takeSpacing.countdownToCaptureGap,
                gap: takeSpacing.viewfinderToThumbnailsGap,
              }}
            >
              <div
                className="relative w-full overflow-hidden rounded-lg"
                style={{
                  height: captureViewfinderHeight,
                  backgroundColor: ADD_PHOTO_LAYOUT.viewfinder.background,
                }}
              >
                {showCamera ? (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored
                    screenshotFormat="image/jpeg"
                    videoConstraints={VIDEO_CONSTRAINTS}
                    onUserMedia={handleUserMedia}
                    onUserMediaError={handleUserMediaError}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : showCameraPlaceholder ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="font-mono text-sm text-white/60">
                      {sessionStarted ? "Starting camera..." : "Tap Capture to Start"}
                    </p>
                  </div>
                ) : null}

                {error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-4 text-center">
                    <p className="font-mono text-sm text-white">{error.message}</p>
                    <button
                      type="button"
                      onClick={() => {
                        resetError();
                        activateCamera();
                        setSessionStarted(true);
                      }}
                      className="font-mono rounded-full bg-white px-4 py-2 text-sm text-black"
                    >
                      Try again
                    </button>
                  </div>
                ) : null}

                {isCountingDown && count !== null && count > 0 ? (
                  <Countdown count={count} />
                ) : null}

                <CameraFlash show={showFlash} />
              </div>

              <div
                className={`flex w-full min-w-0 items-center ${
                  thumbnailRowScrollable
                    ? "justify-start overflow-x-auto overscroll-x-contain"
                    : "justify-center overflow-hidden"
                }`}
                style={{
                  gap: ADD_PHOTO_LAYOUT.thumbnail.gap,
                  WebkitOverflowScrolling: "touch",
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
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#202020]/80">
                              <Image
                                src="/figma/icons/camera-white.svg"
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
          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
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
              className="font-mono text-center text-xs text-black"
              style={{ marginTop: uploadLayout.previewToHintGap }}
            >
              add your photos !
            </p>
          </div>
        )}
      </PageContent>
    </PageShell>
  );
}
