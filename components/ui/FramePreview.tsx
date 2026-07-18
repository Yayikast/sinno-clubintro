"use client";

import Image from "next/image";
import { CoverImage } from "@/components/ui/SlotPhoto";
import type { FrameConfig } from "@/types/photobooth";

interface FramePreviewProps {
  frame: FrameConfig;
  photos?: (string | null)[];
  frameColor?: string;
  textColor?: string;
  captionText?: string;
  className?: string;
  /** Explicit width in px (overrides size preset). */
  width?: number;
  /** Explicit height in px (overrides aspect-ratio sizing). */
  height?: number;
  size?: "sm" | "md" | "lg";
  captionSize?: number;
  onSlotClick?: (index: number) => void;
  hoverSlotIndex?: number | null;
  showPlaceholders?: boolean;
}

export function FramePreview({
  frame,
  photos,
  textColor = "#FFFFFF",
  captionText = "moments of 2026",
  className = "",
  width,
  height,
  size = "md",
  captionSize = 8,
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

  const widthStyle = width ? { width, maxWidth: width } : undefined;
  const heightStyle = height ? { height, maxHeight: height } : undefined;
  const widthClass = width ? "" : sizeClasses[size];

  return (
    <div
      className={`relative mx-auto shrink-0 ${widthClass} ${className}`}
      style={{
        ...widthStyle,
        ...heightStyle,
        aspectRatio: width && height ? undefined : frame.aspectRatio,
      }}
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
              <CoverImage src={photo} alt={`Photo ${index + 1}`} />
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
      />

      {captionText ? (
        <p
          className="font-cursive pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 text-center font-normal leading-none"
          style={{
            top: `${frame.captionY * 100}%`,
            color: textColor,
            fontSize: captionSize,
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
  itemHeight?: number;
  selectedSize?: number;
  selectedBg?: string;
  selectedRadius?: number;
  gap?: number;
}

export function FrameSelector({
  selectedId,
  onSelect,
  frames,
  itemHeight = 50,
  selectedSize = 66,
  selectedBg = "rgba(255, 255, 255, 0.2)",
  selectedRadius = 4,
  gap = 8,
}: FrameSelectorProps) {
  return (
    <div className="flex items-center justify-center" style={{ gap }}>
      {frames.map((frame) => {
        const isSelected = selectedId === frame.id;

        return (
          <button
            key={frame.id}
            type="button"
            onClick={() => onSelect(frame.id)}
            aria-label={frame.label}
            className="flex items-center justify-center transition-colors"
            style={{
              width: selectedSize,
              height: selectedSize,
              borderRadius: selectedRadius,
              backgroundColor: isSelected ? selectedBg : "transparent",
            }}
          >
            <img
              src={frame.iconPath}
              alt=""
              className="w-auto object-contain"
              style={{
                opacity: isSelected ? 1 : 0.55,
                height: itemHeight,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
