"use client";

import { RotateCcw } from "lucide-react";

interface ThumbnailListProps {
  photos: (string | null)[];
  activeIndex: number;
  onRetake?: (index: number) => void;
  showRetake?: boolean;
}

export function ThumbnailList({
  photos,
  activeIndex,
  onRetake,
  showRetake = false,
}: ThumbnailListProps) {
  return (
    <div className="flex justify-center gap-2 px-4">
      {photos.map((photo, index) => {
        const isActive = index === activeIndex;
        const isFilled = photo !== null;

        return (
          <div key={index} className="relative flex flex-col items-center gap-1">
            <div
              className={`relative h-14 w-10 overflow-hidden rounded-md border-2 transition-colors ${
                isActive
                  ? "border-white"
                  : isFilled
                    ? "border-white/40"
                    : "border-white/20"
              }`}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/10 text-xs text-white/50">
                  {index + 1}
                </div>
              )}
            </div>

            {showRetake && isFilled && onRetake ? (
              <button
                type="button"
                onClick={() => onRetake(index)}
                aria-label={`Retake photo ${index + 1}`}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

interface ThumbnailProgressProps {
  current: number;
  total: number;
}

export function ThumbnailProgress({ current, total }: ThumbnailProgressProps) {
  return (
    <p className="text-center text-sm text-zinc-400">
      Photo {Math.min(current + 1, total)} of {total}
    </p>
  );
}
