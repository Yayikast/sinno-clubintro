"use client";

import { Camera, X } from "lucide-react";

interface CameraControlsProps {
  onCapture: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  captureLabel?: string;
  showCancel?: boolean;
}

export function CameraControls({
  onCapture,
  onCancel,
  disabled = false,
  captureLabel = "Capture",
  showCancel = true,
}: CameraControlsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      {showCancel && onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      ) : (
        <div className="h-12 w-12" />
      )}

      <button
        type="button"
        onClick={onCapture}
        disabled={disabled}
        aria-label={captureLabel}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-zinc-950 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Camera className="h-7 w-7" />
      </button>

      <div className="h-12 w-12" />
    </div>
  );
}
