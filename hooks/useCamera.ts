"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type Webcam from "react-webcam";
import {
  boostCameraResolution,
  captureVideoFrame,
  VIDEO_CONSTRAINTS,
} from "@/lib/cameraCapture";
import type { CameraError } from "@/types/photobooth";

export { VIDEO_CONSTRAINTS };

function mapMediaError(error: unknown): CameraError {
  if (typeof error === "string") {
    if (error.toLowerCase().includes("permission")) {
      return {
        type: "permission-denied",
        message:
          "Camera access was denied. Please allow camera permissions in your browser settings.",
      };
    }
    return { type: "unknown", message: error };
  }

  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return {
          type: "permission-denied",
          message:
            "Camera access was denied. Please allow camera permissions in your browser settings.",
        };
      case "NotFoundError":
      case "DevicesNotFoundError":
        return {
          type: "not-found",
          message: "No camera was found on this device.",
        };
      case "NotReadableError":
      case "TrackStartError":
        return {
          type: "not-readable",
          message: "Camera is already in use by another application.",
        };
      case "OverconstrainedError":
        return {
          type: "not-supported",
          message: "Your camera does not support the required settings.",
        };
      default:
        return {
          type: "unknown",
          message: error.message || "An unknown camera error occurred.",
        };
    }
  }

  return {
    type: "unknown",
    message: "An unknown camera error occurred.",
  };
}

interface UseCameraOptions {
  webcamRef: RefObject<Webcam | null>;
  initialActive?: boolean;
}

export function useCamera({ webcamRef, initialActive = false }: UseCameraOptions) {
  const [isActivated, setIsActivated] = useState(initialActive);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    setIsReady(false);
  }, []);

  const capturePhoto = useCallback((): string | null => {
    const video = webcamRef.current?.video;
    if (!video) {
      setError({
        type: "capture-failed",
        message: "Click Capture to try again.",
      });
      return null;
    }

    const screenshot = captureVideoFrame(video, { mirrored: true });
    if (!screenshot) {
      setError({
        type: "capture-failed",
        message: "Click Capture to try again.",
      });
      return null;
    }

    return screenshot;
  }, [webcamRef]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const handleUserMedia = useCallback((stream: MediaStream) => {
    streamRef.current = stream;
    setError(null);

    void boostCameraResolution(stream).finally(() => {
      setIsReady(true);
    });
  }, []);

  const handleUserMediaError = useCallback((mediaError: string | DOMException) => {
    setIsReady(false);
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
