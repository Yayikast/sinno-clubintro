"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type Webcam from "react-webcam";
import {
  boostCameraResolution,
  captureVideoFrame,
  VIDEO_CONSTRAINTS,
} from "@/lib/cameraCapture";
import { theme } from "@/themes";
import type { CameraError } from "@/types/photobooth";

export { VIDEO_CONSTRAINTS };

const cameraCopy = theme.copy.camera;

function mapMediaError(error: unknown): CameraError {
  if (typeof error === "string") {
    if (error.toLowerCase().includes("permission")) {
      return {
        type: "permission-denied",
        message: cameraCopy.permissionDenied,
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
          message: error.message || cameraCopy.unknown,
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
        message: cameraCopy.captureFailed,
      });
      return null;
    }

    const screenshot = captureVideoFrame(video, { mirrored: true });
    if (!screenshot) {
      setError({
        type: "capture-failed",
        message: cameraCopy.captureFailed,
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
