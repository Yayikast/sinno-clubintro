"use client";

import type { ReactNode } from "react";
import type { PhotoSlot } from "@/types/photobooth";
import { getSlotAspectRatio } from "@/lib/photoDisplay";

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Displays a photo with object-fit: cover — never stretches the image.
 * @see lib/photoDisplay.ts
 */
export function CoverImage({ src, alt, className = "" }: CoverImageProps) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
}

interface SlotPhotoProps {
  photo?: string | null;
  slot: PhotoSlot;
  frameAspectRatio: number;
  height?: number;
  /** When set, uses exact px width instead of deriving from slot aspect ratio. */
  width?: number;
  className?: string;
  emptyClassName?: string;
  onClick?: () => void;
  overlay?: ReactNode;
}

/**
 * Thumbnail or preview box sized to match a photostrip slot aspect ratio.
 * Photos are never stretched.
 */
export function SlotPhoto({
  photo,
  slot,
  frameAspectRatio,
  height = 48,
  width,
  className = "",
  emptyClassName = "bg-[#202020]",
  onClick,
  overlay,
}: SlotPhotoProps) {
  const aspectRatio = getSlotAspectRatio(slot, frameAspectRatio);
  const resolvedWidth = width ?? height * aspectRatio;

  const content = (
    <>
      {photo ? (
        <CoverImage src={photo} alt="Captured photo" />
      ) : (
        <div className={`h-full w-full ${emptyClassName}`} />
      )}
      {overlay}
    </>
  );

  const style =
    width !== undefined
      ? {
          width: resolvedWidth,
          minWidth: resolvedWidth,
          maxWidth: resolvedWidth,
          height,
          minHeight: height,
          maxHeight: height,
          boxSizing: "border-box",
        }
      : {
          width: resolvedWidth,
          height,
          aspectRatio: `${aspectRatio}`,
          boxSizing: "border-box",
        };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`relative m-0 shrink-0 overflow-hidden rounded-sm border-0 p-0 ${className}`}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`relative m-0 shrink-0 overflow-hidden rounded-sm p-0 ${className}`}
      style={style}
    >
      {content}
    </div>
  );
}
