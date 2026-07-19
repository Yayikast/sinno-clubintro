"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CoverImage } from "@/components/ui/SlotPhoto";
import { useAvailableContentWidth } from "@/hooks/useAvailableContentWidth";
import { getFrameSelectorLayout } from "@/lib/landingLayout";
import {
  clampStripCaption,
  getFittedStripCaptionFontSize,
  getStripCaptionPositionY,
  STRIP_CAPTION_MAX_WIDTH_RATIO,
  STRIP_CAPTION_Y_OFFSET_PX,
} from "@/lib/stripCaption";
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
  onSlotClick?: (index: number) => void;
  /** Slot currently targeted for upload / replace. */
  activeSlotIndex?: number | null;
  hoverSlotIndex?: number | null;
  showPlaceholders?: boolean;
  placeholderBg?: string;
  overlayBg?: string;
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
  onSlotClick,
  activeSlotIndex = null,
  hoverSlotIndex = null,
  showPlaceholders = false,
  placeholderBg = "#202020",
  overlayBg = "rgba(32, 32, 32, 0.8)",
}: FramePreviewProps) {
  const slots = photos ?? Array.from({ length: frame.photoCount }, () => null);
  const [internalHoverIndex, setInternalHoverIndex] = useState<number | null>(null);
  const hasAnyPhoto = slots.some(Boolean);

  const sizeClasses = {
    sm: "max-w-[140px]",
    md: "max-w-[220px]",
    lg: "max-w-[280px]",
  };

  const presetWidths = {
    sm: 140,
    md: 220,
    lg: 280,
  } as const;

  const effectiveWidth = width ?? presetWidths[size];
  const previewHeight = height ?? effectiveWidth / frame.aspectRatio;
  const displayCaption = clampStripCaption(captionText).trim();
  const captionFontSize = useMemo(
    () =>
      getFittedStripCaptionFontSize(
        effectiveWidth,
        displayCaption,
        frame.captionFontSizeScale ?? 1,
      ),
    [displayCaption, effectiveWidth, frame.captionFontSizeScale],
  );
  const galleryIconSize = useMemo(
    () => Math.min(20, Math.max(12, Math.round(effectiveWidth * 0.12))),
    [effectiveWidth],
  );

  const widthStyle = width
    ? { width, maxWidth: `min(${width}px, 100%)` }
    : undefined;
  const heightStyle = height ? { height, maxHeight: height } : undefined;
  const widthClass = width ? "" : sizeClasses[size];

  return (
    <div
      className={`relative mx-auto w-full min-w-0 max-w-full shrink-0 ${widthClass} ${className}`}
      style={{
        ...widthStyle,
        ...heightStyle,
        aspectRatio: width && height ? undefined : frame.aspectRatio,
      }}
    >
      {slots.map((photo, index) => {
        const slot = frame.slots[index];
        if (!slot) return null;

        const isActive = activeSlotIndex === index;
        const isHovered =
          hoverSlotIndex === index ||
          (hoverSlotIndex === null && internalHoverIndex === index);
        const showGalleryOverlay =
          onSlotClick &&
          (isHovered || (isActive && !photo && hasAnyPhoto));
        const SlotWrapper = onSlotClick ? "button" : "div";

        return (
          <SlotWrapper
            key={index}
            type={onSlotClick ? "button" : undefined}
            onClick={onSlotClick ? () => onSlotClick(index) : undefined}
            onMouseEnter={
              onSlotClick ? () => setInternalHoverIndex(index) : undefined
            }
            onMouseLeave={
              onSlotClick ? () => setInternalHoverIndex(null) : undefined
            }
            aria-label={
              onSlotClick
                ? photo
                  ? `Replace photo ${index + 1}`
                  : `Add photo ${index + 1}`
                : undefined
            }
            className={`absolute m-0 overflow-hidden border-0 p-0 ${onSlotClick ? "cursor-pointer" : ""}`}
            style={{
              left: `${slot.x * 100}%`,
              top: `${slot.y * 100}%`,
              width: `${slot.width * 100}%`,
              height: `${slot.height * 100}%`,
              minHeight: 0,
            }}
          >
            {photo ? (
              <CoverImage src={photo} alt={`Photo ${index + 1}`} />
            ) : showPlaceholders ? (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ backgroundColor: placeholderBg }}
              >
                <Image
                  src="/figma/icons/gallery.svg"
                  alt=""
                  width={galleryIconSize}
                  height={galleryIconSize}
                  className="opacity-60"
                />
              </div>
            ) : (
              <div className="h-full w-full bg-[#FFDEE6]" />
            )}

            {showGalleryOverlay ? (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: overlayBg }}
              >
                <Image
                  src="/figma/icons/gallery.svg"
                  alt=""
                  width={galleryIconSize}
                  height={galleryIconSize}
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

      {displayCaption ? (
        <p
          className="font-cursive pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 overflow-hidden text-ellipsis whitespace-nowrap text-center font-normal leading-none"
          style={{
            top: getStripCaptionPositionY(
              frame.captionY,
              previewHeight,
              frame.captionYOffset ?? STRIP_CAPTION_Y_OFFSET_PX,
            ),
            color: textColor,
            fontSize: captionFontSize,
            maxWidth: `${effectiveWidth * STRIP_CAPTION_MAX_WIDTH_RATIO}px`,
          }}
        >
          {displayCaption}
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
  const availableContentWidth = useAvailableContentWidth();
  const layout = getFrameSelectorLayout(frames.length, availableContentWidth);
  const size = layout.size || selectedSize;
  const rowGap = layout.gap || gap;
  const iconHeight = layout.iconHeight || itemHeight;
  const radius = layout.radius || selectedRadius;

  return (
    <div
      className="flex w-full min-w-0 items-center justify-center"
      style={{ gap: rowGap, maxWidth: availableContentWidth }}
    >
      {frames.map((frame) => {
        const isSelected = selectedId === frame.id;

        return (
          <button
            key={frame.id}
            type="button"
            onClick={() => onSelect(frame.id)}
            aria-label={frame.label}
            aria-pressed={isSelected}
            className="relative m-0 flex shrink-0 items-center justify-center overflow-hidden border-0 p-0 transition-opacity"
            style={{
              width: size,
              height: size,
              minWidth: size,
              minHeight: size,
              borderRadius: radius,
            }}
          >
            {isSelected ? (
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  borderRadius: radius,
                  backgroundColor: selectedBg,
                }}
                aria-hidden
              />
            ) : null}
            <img
              src={frame.iconPath}
              alt=""
              className="relative z-[1] w-auto object-contain"
              style={{
                opacity: isSelected ? 1 : 0.55,
                height: iconHeight,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
