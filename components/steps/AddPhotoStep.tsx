"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { usePhotobooth } from "@/context/PhotoboothProvider";
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

  const performCapture = useCallback(() => {
    setIsCapturing(true);
    setShowFlash(true);
    playShutterSound();

    window.setTimeout(() => {
      const screenshot = capturePhoto();
      setShowFlash(false);
      setIsCapturing(false);

      if (!screenshot) return;

      setPhotoAtIndex(targetIndex, screenshot);
      setActiveSlotIndex(null);
      setIsRetaking(false);
    }, 150);
  }, [capturePhoto, setActiveSlotIndex, setIsRetaking, setPhotoAtIndex, targetIndex]);

  const { count, isCountingDown, start: startCountdown, cancel: cancelCountdown } =
    useCountdown({
      duration: countdownSeconds,
      onComplete: performCapture,
    });

  const handleCaptureClick = () => {
    if (isCapturing || isCountingDown || showFlash) return;

    if (!sessionStarted) {
      activateCamera();
      setSessionStarted(true);
    }

    startCountdown();
  };

  const handleThumbnailClick = (index: number) => {
    if (photoMode !== "take") return;
    setActiveSlotIndex(index);
    setIsRetaking(true);
    if (!sessionStarted) {
      activateCamera();
      setSessionStarted(true);
    }
  };

  const handleUploadSlotClick = (index: number) => {
    setActiveSlotIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || activeSlotIndex === null) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoAtIndex(activeSlotIndex, reader.result);
        setActiveSlotIndex(null);
      }
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

      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <ModeTabs mode={photoMode} onChange={handleModeChange} />

        {photoMode === "take" ? (
          <>
            <CountdownPicker
              value={countdownSeconds}
              onChange={setCountdownSeconds}
            />

            <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-lg bg-[#202020]">
              {showCamera ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  mirrored
                  screenshotFormat="image/jpeg"
                  videoConstraints={VIDEO_CONSTRAINTS}
                  onUserMedia={handleUserMedia}
                  onUserMediaError={handleUserMediaError}
                  className="h-full w-full object-cover"
                />
              ) : showCameraPlaceholder ? (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="font-mono text-sm text-white/60">
                    {sessionStarted ? "Starting camera..." : "Tap Capture to start"}
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

            <div className="flex justify-center gap-2">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => photo && handleThumbnailClick(index)}
                  onMouseEnter={() => photo && setHoverSlotIndex(index)}
                  onMouseLeave={() => setHoverSlotIndex(null)}
                  className="relative h-14 w-14 overflow-hidden rounded-sm bg-[#202020]"
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : null}

                  {hoverSlotIndex === index && photo ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#202020]/80">
                      <Image
                        src="/figma/icons/camera-white.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                    </div>
                  ) : null}
                </button>
              ))}
            </div>

            <p className="font-mono text-center text-xs text-black">
              {isCountingDown || isCapturing
                ? "capturing the moments..."
                : allPhotosFilled
                  ? "select a photo to retake or click next to choose your frame !"
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
              {allPhotosFilled
                ? "add your photos !"
                : "add your photos !"}
            </p>
          </>
        )}
      </div>
    </PageShell>
  );
}
