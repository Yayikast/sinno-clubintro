"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { theme } from "@/themes";

const COLUMN_GAP = 16;
const CONTROLS_MIN_WIDTH = 260;
const CONTROLS_MAX_WIDTH = 340;

interface Size {
  width: number;
  height: number;
}

interface LandscapeShellProps {
  showBack?: boolean;
  onBack?: () => void;
  /** Left side, full height — the photo, viewfinder or strip. Sized to fit exactly. */
  media: (size: Size) => ReactNode;
  /** Right column, under the header. Receives the column's width. */
  controls: (controlsWidth: number) => ReactNode;
  /** Pinned to the bottom of the right column (the main action buttons). */
  footer?: ReactNode;
}

/**
 * Side-by-side layout for phones turned sideways, where the portrait column is
 * far too tall to fit: the main visual on the left at full height, and a
 * compact header + controls + actions on the right.
 */
export function LandscapeShell({
  showBack = false,
  onBack,
  media,
  controls,
  footer,
}: LandscapeShellProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowSize, setRowSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setRowSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  const controlsWidth = Math.round(
    Math.min(CONTROLS_MAX_WIDTH, Math.max(CONTROLS_MIN_WIDTH, rowSize.width * 0.42)),
  );
  const mediaSize = {
    width: Math.max(0, rowSize.width - controlsWidth - COLUMN_GAP),
    height: rowSize.height,
  };
  const isMeasured = rowSize.width > 0 && rowSize.height > 0;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src={theme.assets.background}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          preload
        />
      </div>

      <div
        ref={rowRef}
        className="box-border flex h-full w-full"
        style={{
          gap: COLUMN_GAP,
          // Notched phones put the notch on the left or right in landscape.
          paddingTop: "max(12px, env(safe-area-inset-top, 0px))",
          paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
          paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
        }}
      >
        <div className="flex min-w-0 flex-1 items-center justify-center">
          {isMeasured ? media(mediaSize) : null}
        </div>

        <div className="flex h-full shrink-0 flex-col" style={{ width: controlsWidth }}>
          <header className="relative shrink-0 text-center">
            {showBack && onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={theme.copy.shell.backAriaLabel}
                className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center"
              >
                <Image src={theme.assets.backIcon} alt="" width={18} height={18} />
              </button>
            ) : null}
            <h1 className="font-cursive text-[28px] font-normal leading-none text-black">
              {theme.brand.name}
            </h1>
            <p className="font-mono text-[10px] font-normal leading-normal text-black">
              {theme.brand.tagline}
            </p>
          </header>

          <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
            {isMeasured ? controls(controlsWidth) : null}
          </div>

          {footer ? (
            <div className="flex shrink-0 flex-col items-center pt-2">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
