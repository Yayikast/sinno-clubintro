"use client";

import { AlertCircle, Camera, Loader2 } from "lucide-react";
import type { CameraError } from "@/types/photobooth";

interface PermissionErrorProps {
  error: CameraError;
  onRetry: () => void;
}

export function PermissionError({ error, onRetry }: PermissionErrorProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Camera unavailable</h2>
        <p className="text-sm text-zinc-400">{error.message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950"
      >
        Try again
      </button>
    </div>
  );
}

export function CameraLoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-white" />
      <p className="text-sm text-zinc-400">Starting camera...</p>
    </div>
  );
}

interface CameraIdleStateProps {
  onStart: () => void;
}

export function CameraIdleState({ onStart }: CameraIdleStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
        <Camera className="h-10 w-10 text-white" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Ready to snap?</h2>
        <p className="text-sm text-zinc-400">
          We&apos;ll use your front camera to take photobooth shots.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-zinc-950"
      >
        Take Photos
      </button>
    </div>
  );
}
