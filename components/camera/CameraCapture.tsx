"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Webcam from "react-webcam";
import { Countdown } from "@/components/camera/Countdown";
import { CameraControls } from "@/components/camera/CameraControls";
import { CameraFlash } from "@/components/camera/CameraFlash";
import {
  CameraIdleState,
  CameraLoadingState,
  PermissionError,
} from "@/components/camera/PermissionError";
import {
  ThumbnailList,
  ThumbnailProgress,
} from "@/components/camera/ThumbnailList";
import { useCountdown } from "@/hooks/useCountdown";
import { useCamera, VIDEO_CONSTRAINTS } from "@/hooks/useCamera";
import { playShutterSound } from "@/lib/shutterSound";
import type { CountdownSeconds } from "@/types/photobooth";

interface CameraCaptureProps {
  photoCount: number;
  countdownSeconds: CountdownSeconds;
  initialPhotos?: (string | null)[];
  retakeIndex?: number | null;
  autoStart?: boolean;
  onPhotoCaptured: (index: number, photo: string) => void;
  onComplete: (photos: string[]) => void;
  onCancel?: () => void;
}

export function CameraCapture({
  photoCount,
  countdownSeconds,
  initialPhotos,
  retakeIndex = null,
  autoStart = false,
  onPhotoCaptured,
  onComplete,
  onCancel,
}: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const captureTargetRef = useRef(0);
  const hasCompletedRef = useRef(false);

  const [photos, setPhotos] = useState<(string | null)[]>(
    () => initialPhotos ?? Array.from({ length: photoCount }, () => null),
  );
  const [showFlash, setShowFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(autoStart);

  const {
    isActivated,
    isReady,
    error,
    activateCamera,
    deactivateCamera,
    capturePhoto,
    resetError,
    handleUserMedia,
    handleUserMediaError,
  } = useCamera({ webcamRef, initialActive: autoStart });

  const firstEmptyIndex = useMemo(
    () => photos.findIndex((photo) => photo === null),
    [photos],
  );

  const activeIndex =
    retakeIndex !== null
      ? retakeIndex
      : firstEmptyIndex === -1
        ? photoCount - 1
        : firstEmptyIndex;

  const allPhotosTaken = photos.every((photo) => photo !== null);

  const performCapture = useCallback(() => {
    setIsCapturing(true);
    setShowFlash(true);
    playShutterSound();

    window.setTimeout(() => {
      const screenshot = capturePhoto();
      setShowFlash(false);

      if (!screenshot) {
        setIsCapturing(false);
        return;
      }

      const targetIndex = captureTargetRef.current;

      setPhotos((current) => {
        const next = [...current];
        next[targetIndex] = screenshot;
        return next;
      });

      onPhotoCaptured(targetIndex, screenshot);
      setIsCapturing(false);
    }, 150);
  }, [capturePhoto, onPhotoCaptured]);

  const { count, isCountingDown, start: startCountdown, cancel: cancelCountdown } =
    useCountdown({
      duration: countdownSeconds,
      onComplete: performCapture,
    });

  const handleStartSession = useCallback(() => {
    hasCompletedRef.current = false;
    activateCamera();
    setSessionStarted(true);
  }, [activateCamera]);

  const handleCapture = useCallback(() => {
    if (isCapturing || isCountingDown || showFlash) return;

    captureTargetRef.current =
      retakeIndex !== null
        ? retakeIndex
        : firstEmptyIndex === -1
          ? photoCount - 1
          : firstEmptyIndex;

    startCountdown();
  }, [
    firstEmptyIndex,
    isCapturing,
    isCountingDown,
    photoCount,
    retakeIndex,
    showFlash,
    startCountdown,
  ]);

  const handleCancel = useCallback(() => {
    cancelCountdown();
    deactivateCamera();
    setSessionStarted(false);
    onCancel?.();
  }, [cancelCountdown, deactivateCamera, onCancel]);

  useEffect(() => {
    if (!allPhotosTaken || hasCompletedRef.current) return;

    hasCompletedRef.current = true;
    const completedPhotos = photos.filter((photo): photo is string => photo !== null);
    deactivateCamera();
    onComplete(completedPhotos);
  }, [allPhotosTaken, deactivateCamera, onComplete, photos]);

  const showPreview = isActivated && !error;
  const isLoading = isActivated && !isReady && !error;
  const isInteractionBlocked = isCountingDown || isCapturing || showFlash;

  if (!sessionStarted) {
    return <CameraIdleState onStart={handleStartSession} />;
  }

  if (error) {
    return (
      <PermissionError
        error={error}
        onRetry={() => {
          resetError();
          activateCamera();
        }}
      />
    );
  }

  if (isLoading) {
    return <CameraLoadingState />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-md flex-1 overflow-hidden rounded-2xl bg-black">
        {showPreview ? (
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
        ) : null}

        {isCountingDown && count !== null && count > 0 ? (
          <Countdown count={count} />
        ) : null}

        <CameraFlash show={showFlash} />
      </div>

      <div className="mt-4 space-y-4">
        <ThumbnailProgress current={activeIndex} total={photoCount} />
        <ThumbnailList photos={photos} activeIndex={activeIndex} />
        <CameraControls
          onCapture={handleCapture}
          onCancel={handleCancel}
          disabled={isInteractionBlocked || !isReady}
          captureLabel={
            retakeIndex !== null
              ? `Retake photo ${retakeIndex + 1}`
              : `Capture photo ${activeIndex + 1}`
          }
        />
      </div>
    </div>
  );
}
