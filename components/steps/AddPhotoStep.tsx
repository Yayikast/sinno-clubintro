"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { SlotPhoto } from "@/components/ui/SlotPhoto";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { ADD_PHOTO_LAYOUT, getAddPhotoThumbnailSizes, getUploadPreviewSize } from "@/lib/addPhotoLayout";
import {
  cropPhotoToSlot,
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
import { useAvailableContentWidth } from "@/hooks/useAvailableContentWidth";
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
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
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

  const availableContentWidth = useAvailableContentWidth();

  const firstEmptyIndex = photos.findIndex((photo) => photo === null);
  const targetIndex =
    activeSlotIndex !== null
      ? activeSlotIndex
      : firstEmptyIndex === -1
        ? 0
        : firstEmptyIndex;

  const thumbnailSizes = getAddPhotoThumbnailSizes(
    frame.id,
    Math.min(ADD_PHOTO_LAYOUT.viewfinder.width, availableContentWidth),
  );
  const uploadPreviewSize = getUploadPreviewSize(frame.aspectRatio);
  const uploadLayout = ADD_PHOTO_LAYOUT.upload;
  const takeSpacing = ADD_PHOTO_LAYOUT.takePhoto;
  const captureWidth = Math.min(
    ADD_PHOTO_LAYOUT.viewfinder.width,
    availableContentWidth,
  );
  const captureHeight =
    (captureWidth / ADD_PHOTO_LAYOUT.viewfinder.width) *
    ADD_PHOTO_LAYOUT.viewfinder.height;

  captureSlotIndexRef.current = targetIndex;

  const performCapture = useCallback(() => {
    const slotIndex = captureSlotIndexRef.current;
    const slot = frame.slots[slotIndex];
    if (!slot) return;

    setIsCapturing(true);
    setShowFlash(true);
    playShutterSound();

    window.setTimeout(() => {
      void (async () => {
        const screenshot = capturePhoto();
        setShowFlash(false);

        if (!screenshot) {
          setIsCapturing(false);
          return;
        }

        try {
          const cropped = await cropPhotoToSlot(screenshot, slot, frame.aspectRatio);
          setPhotoAtIndex(slotIndex, cropped);
          setActiveSlotIndex(null);
          setIsRetaking(false);
        } catch {
          setPhotoAtIndex(slotIndex, screenshot);
        } finally {
          setIsCapturing(false);
        }
      })();
    }, 150);
  }, [
    capturePhoto,
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

  const handleCaptureClick = () => {
    if (isCapturing || isCountingDown || showFlash) return;

    captureSlotIndexRef.current = targetIndex;
    setActiveSlotIndex(null);
    setIsRetaking(false);

    if (!sessionStarted) {
      activateCamera();
      setSessionStarted(true);
    }

    startCountdown();
  };

  const handleThumbnailClick = (index: number) => {
    if (photoMode !== "take") return;
    if (!photos[index]) return;
    if (isCapturing || showFlash) return;

    if (isCountingDown) {
      cancelCountdown();
    }

    captureSlotIndexRef.current = index;
    setActiveSlotIndex(index);
    setIsRetaking(true);

    if (!sessionStarted) {
      activateCamera();
      setSessionStarted(true);
    }

    startCountdown();
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
    isCountingDown || isCapturing
      ? "capturing the moments..."
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
          : `photo ${targetIndex + 1} of ${frame.photoCount}`;

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
            <PinkButton onClick={handleCaptureClick} disabled={isCapturing || isCountingDown}>
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
              className="flex w-full min-w-0 max-w-full flex-col items-center"
              style={{
                marginTop: takeSpacing.countdownToCaptureGap,
                gap: takeSpacing.viewfinderToThumbnailsGap,
              }}
            >
              <div
                className="relative w-full max-w-full overflow-hidden rounded-lg"
                style={{
                  width: captureWidth,
                  height: captureHeight,
                  maxWidth: "100%",
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
                className="flex w-full min-w-0 items-center justify-center overflow-hidden"
                style={{
                  width: captureWidth,
                  maxWidth: "100%",
                  gap: ADD_PHOTO_LAYOUT.thumbnail.gap,
                }}
              >
                {photos.map((photo, index) => {
                  const slot = frame.slots[index];
                  const size = thumbnailSizes[index];
                  if (!slot || !size) return null;

                  return (
                    <div
                      key={index}
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
                          photo && !isCapturing && !showFlash
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
              width={Math.min(uploadPreviewSize.width, availableContentWidth)}
              height={
                (Math.min(uploadPreviewSize.width, availableContentWidth) /
                  uploadPreviewSize.width) *
                uploadPreviewSize.height
              }
              captionText={captionText}
              captionSize={uploadLayout.captionSize}
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
