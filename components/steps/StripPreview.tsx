"use client";

import { getAspectRatioValue } from "@/lib/layouts";
import type { LayoutConfig } from "@/types/photobooth";

interface StripPreviewProps {
  layout: LayoutConfig;
  photos?: (string | null)[];
  frameColor?: string;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function StripPreview({
  layout,
  photos,
  frameColor = "#FFFFFF",
  className = "",
  selected = false,
  onClick,
}: StripPreviewProps) {
  const aspectRatio = getAspectRatioValue(layout.aspectRatio);
  const slots = photos ?? Array.from({ length: layout.photoCount }, () => null);

  const content = (
    <div
      className={`relative w-full overflow-hidden rounded-lg shadow-lg transition-all ${
        selected ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : ""
      } ${className}`}
      style={{
        aspectRatio: `${aspectRatio}`,
        backgroundColor: frameColor,
        padding: "6%",
      }}
    >
      <div
        className="grid h-full w-full gap-[3%]"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
          gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
        }}
      >
        {slots.map((photo, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-sm bg-zinc-300"
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-400/60">
                <span className="text-[10px] font-medium text-zinc-600">
                  {index + 1}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left transition-transform active:scale-[0.98]"
      >
        {content}
      </button>
    );
  }

  return content;
}
