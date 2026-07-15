"use client";

import Image from "next/image";
import type { FrameConfig } from "@/types/photobooth";

interface FramePreviewProps {
  frame: FrameConfig;
  photos?: (string | null)[];
  frameColor?: string;
  textColor?: string;
  captionText?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  onSlotClick?: (index: number) => void;
  hoverSlotIndex?: number | null;
  showPlaceholders?: boolean;
}

export function FramePreview({
  frame,
  photos,
  frameColor = "#000000",
  textColor = "#FFFFFF",
  captionText = "moments of 2026",
  className = "",
  size = "md",
  onSlotClick,
  hoverSlotIndex = null,
  showPlaceholders = false,
}: FramePreviewProps) {
  const slots = photos ?? Array.from({ length: frame.photoCount }, () => null);

  const sizeClasses = {
    sm: "max-w-[140px]",
    md: "max-w-[220px]",
    lg: "max-w-[280px]",
  };

  return (
    <div
      className={`relative mx-auto w-full ${sizeClasses[size]} ${className}`}
      style={{ aspectRatio: frame.aspectRatio }}
    >
      {slots.map((photo, index) => {
        const slot = frame.slots[index];
        if (!slot) return null;

        const isHovered = hoverSlotIndex === index;
        const SlotWrapper = onSlotClick ? "button" : "div";

        return (
          <SlotWrapper
            key={index}
            type={onSlotClick ? "button" : undefined}
            onClick={onSlotClick ? () => onSlotClick(index) : undefined}
            className={`absolute overflow-hidden ${onSlotClick ? "cursor-pointer" : ""}`}
            style={{
              left: `${slot.x * 100}%`,
              top: `${slot.y * 100}%`,
              width: `${slot.width * 100}%`,
              height: `${slot.height * 100}%`,
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
            ) : showPlaceholders ? (
              <div className="flex h-full w-full items-center justify-center bg-[#2a2a2a]">
                <Image
                  src="/figma/icons/gallery.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="opacity-60"
                />
              </div>
            ) : (
              <div className="h-full w-full bg-[#FFDEE6]" />
            )}

            {isHovered ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#202020]/80">
                <Image
                  src="/figma/icons/gallery.svg"
                  alt=""
                  width={24}
                  height={24}
                />
              </div>
            ) : null}
          </SlotWrapper>
        );
      })}

      <Image
        src={frame.svgPath}
        alt=""
        fill
        className="pointer-events-none object-contain"
        style={{
          filter: frameColor === "#000000" ? "none" : undefined,
        }}
      />

      {captionText ? (
        <p
          className="font-cursive pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 text-center text-sm font-bold"
          style={{
            top: `${frame.captionY * 100}%`,
            color: textColor,
          }}
        >
          {captionText}
        </p>
      ) : null}
    </div>
  );
}

interface FrameSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  frames: FrameConfig[];
}

export function FrameSelector({ selectedId, onSelect, frames }: FrameSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {frames.map((frame) => {
        const isSelected = selectedId === frame.id;

        return (
          <button
            key={frame.id}
            type="button"
            onClick={() => onSelect(frame.id)}
            aria-label={frame.label}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
              isSelected ? "bg-[#FFEDF1]" : "bg-transparent"
            }`}
          >
            <Image
              src={frame.iconPath}
              alt=""
              width={28}
              height={28}
              className="h-7 w-auto object-contain"
              style={{ opacity: isSelected ? 1 : 0.7 }}
            />
          </button>
        );
      })}
    </div>
  );
}
