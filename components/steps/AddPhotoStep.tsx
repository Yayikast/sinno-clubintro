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
import { ADD_PHOTO_LAYOUT, getAddPhotoThumbnailSizes } from "@/lib/addPhotoLayout";
import {
  cropPhotoToSlot,
} from "@/lib/photoDisplay";
import {
  CountdownPicker,
  ModeTabs,
  PageShell,
  PinkButton,
} from "@/components/ui/PageShell";
import { FramePreview } from "@/components/ui/FramePreview";
import { Countdown } from "@/components/camera/Countdown";
import { CameraFlash } from "@/components/camera/CameraFlash";
import { useCountdown } from "@/hooks/useCountdown";
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

  const firstEmptyIndex = photos.findIndex((photo) => photo === null);
  const targetIndex =
    activeSlotIndex !== null
      ? activeSlotIndex
      : firstEmptyIndex === -1
        ? 0
        : firstEmptyIndex;

  const thumbnailSizes = getAddPhotoThumbnailSizes(frame.id);

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

    const slot = frame.slots[activeSlotIndex];
    if (!slot) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      void cropPhotoToSlot(reader.result, slot, frame.aspectRatio)
        .then((cropped) => setPhotoAtIndex(activeSlotIndex, cropped))
        .catch(() => setPhotoAtIndex(activeSlotIndex, reader.result as string))
        .finally(() => setActiveSlotIndex(null));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleModeChange = (mode: "take" | "upload") => {
    if (mode === "upload") {
      cancelCountdown();
      setSessionStarted(false);
    }
    setPhotoMode(mode);
  };

  const showCamera = photoMode === "take" && sessionStarted && !error;
  const showCameraPlaceholder =
    photoMode === "take" && (!sessionStarted || !isReady) && !error;

  return (
    <PageShell
      showBack
      onBack={goBack}
      footer={
        allPhotosFilled ? (
          <PinkButton onClick={() => goToStep("customize")}>Next</PinkButton>
        ) : photoMode === "take" ? (
          <PinkButton onClick={handleCaptureClick} disabled={isCapturing || isCountingDown}>
            <Image src="/figma/icons/camera-black.svg" alt="" width={20} height={20} />
            Capture
          </PinkButton>
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

      <div
        className="mx-auto flex w-full flex-col items-center gap-4"
        style={{
          maxWidth: ADD_PHOTO_LAYOUT.contentWidth,
          marginTop: ADD_PHOTO_LAYOUT.headerToTabsGap,
        }}
      >
        <ModeTabs mode={photoMode} onChange={handleModeChange} />

        {photoMode === "take" ? (
          <>
            <CountdownPicker
              value={countdownSeconds}
              onChange={setCountdownSeconds}
            />

            <div
              className="relative overflow-hidden rounded-lg"
              style={{
                width: ADD_PHOTO_LAYOUT.viewfinder.width,
                height: ADD_PHOTO_LAYOUT.viewfinder.height,
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
              className="flex items-center justify-center overflow-hidden"
              style={{
                width: ADD_PHOTO_LAYOUT.viewfinder.width,
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

            <p className="font-mono text-center text-xs text-black">
              {isCountingDown || isCapturing
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
                    : `photo ${targetIndex + 1} of ${frame.photoCount}`}
            </p>
          </>
        ) : (
          <>
            <FramePreview
              frame={frame}
              photos={photos}
              size="lg"
              showPlaceholders
              onSlotClick={handleUploadSlotClick}
              hoverSlotIndex={activeSlotIndex}
            />

            <p className="font-mono text-center text-xs text-black">
              add your photos !
            </p>
          </>
        )}
      </div>
    </PageShell>
  );
}
