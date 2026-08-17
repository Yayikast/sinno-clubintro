"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type Webcam from "react-webcam";
import {
  boostCameraResolution,
  captureVideoFrame,
  getVideoConstraints,
} from "@/lib/cameraCapture";
import { theme } from "@/themes";
import type { CameraError } from "@/types/photobooth";

export { getVideoConstraints };

const cameraCopy = theme.copy.camera;

/**
 * Always returns one of our own plain-language messages — never the raw
 * browser/library error text, which can be technical (e.g. "Could not start
 * video source") and meaningless to someone who isn't a developer.
 */
function mapMediaError(error: unknown): CameraError {
  if (typeof error === "string") {
    if (error.toLowerCase().includes("permission")) {
      return {
        type: "permission-denied",
        message: cameraCopy.permissionDenied,
      };
    }
    return { type: "unknown", message: cameraCopy.unknown };
  }

  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return {
          type: "permission-denied",
          message: cameraCopy.permissionDenied,
        };
      case "NotFoundError":
      case "DevicesNotFoundError":
        return {
          type: "not-found",
          message: cameraCopy.notFound,
        };
      case "NotReadableError":
      case "TrackStartError":
        return {
          type: "not-readable",
          message: cameraCopy.notReadable,
        };
      case "OverconstrainedError":
        return {
          type: "not-supported",
          message: cameraCopy.notSupported,
        };
      default:
        return {
          type: "unknown",
          message: cameraCopy.unknown,
        };
    }
  }

  return {
    type: "unknown",
    message: cameraCopy.unknown,
  };
}

interface UseCameraOptions {
  webcamRef: RefObject<Webcam | null>;
  initialActive?: boolean;
  /** Whether the currently selected camera should mirror its capture (front/selfie cameras only). */
  mirrored?: boolean;
  /**
   * Identifies which physical camera is currently selected (e.g. its deviceId).
   * Changing this while activated means "the user switched cameras."
   */
  cameraKey?: string;
}

export function useCamera({
  webcamRef,
  initialActive = false,
  mirrored = true,
  cameraKey,
}: UseCameraOptions) {
  const [isActivated, setIsActivated] = useState(initialActive);
  const [error, setError] = useState<CameraError | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Which camera the live stream is ready for. Derived readiness (rather than
   * a separate boolean reset in an effect) means switching cameras
   * immediately reads as "not ready" until the new stream reports back.
   */
  const [readyCameraKey, setReadyCameraKey] = useState<string | undefined>(undefined);
  const isReady = readyCameraKey === cameraKey;

  const activateCamera = useCallback(() => {
    setError(null);
    setIsActivated(true);
    return true;
  }, []);

  const deactivateCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActivated(false);
    setReadyCameraKey(undefined);
  }, []);

  const capturePhoto = useCallback((): string | null => {
    const video = webcamRef.current?.video;
    if (!video) {
      setError({
        type: "capture-failed",
        message: cameraCopy.captureFailed,
      });
      return null;
    }

    const screenshot = captureVideoFrame(video, { mirrored });
    if (!screenshot) {
      setError({
        type: "capture-failed",
        message: cameraCopy.captureFailed,
      });
      return null;
    }

    return screenshot;
  }, [webcamRef, mirrored]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const handleUserMedia = useCallback(
    (stream: MediaStream) => {
      streamRef.current = stream;
      setError(null);

      void boostCameraResolution(stream).finally(() => {
        setReadyCameraKey(cameraKey);
      });
    },
    [cameraKey],
  );

  const handleUserMediaError = useCallback((mediaError: string | DOMException) => {
    setReadyCameraKey(undefined);
    setError(mapMediaError(mediaError));
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isActivated,
    isReady,
    error,
    activateCamera,
    deactivateCamera,
    capturePhoto,
    resetError,
    handleUserMedia,
    handleUserMediaError,
  };
}
