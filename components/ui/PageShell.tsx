"use client";

import { ADD_PHOTO_LAYOUT } from "@/lib/addPhotoLayout";
import Image from "next/image";
import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  footer?: ReactNode;
  /** Max content width in px (Figma frame width). */
  maxWidth?: number;
  paddingX?: number;
  paddingY?: number;
  titleClassName?: string;
  subtitleClassName?: string;
  mainClassName?: string;
  footerClassName?: string;
}

export function PageShell({
  children,
  showBack = false,
  onBack,
  footer,
  maxWidth = 393,
  paddingX = 32,
  paddingY = 56,
  titleClassName = "font-cursive text-[40px] font-normal leading-none text-black",
  subtitleClassName = "font-mono text-[12px] font-normal leading-normal text-black",
  mainClassName = "",
  footerClassName = "",
}: PageShellProps) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/figma/decorations/background.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      <div
        className="mx-auto flex min-h-dvh w-full flex-1 flex-col"
        style={{
          maxWidth,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          paddingTop: `max(${paddingY}px, calc(${paddingY}px + env(safe-area-inset-top, 0px)))`,
          paddingBottom: `max(${paddingY}px, calc(${paddingY}px + env(safe-area-inset-bottom, 0px)))`,
        }}
      >
        <header className="relative shrink-0 text-center">
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center"
            >
              <Image src="/figma/icons/back.svg" alt="" width={20} height={20} />
            </button>
          ) : null}

          <h1 className={titleClassName}>PhotoBooth</h1>
          <p className={subtitleClassName}>- capture the moments -</p>
        </header>

        <main className={`flex min-h-0 flex-1 flex-col ${mainClassName}`}>
          {children}
        </main>

        {footer ? (
          <footer className={`shrink-0 ${footerClassName}`}>{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}

interface PinkButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
  textSize?: number;
  height?: number;
  width?: number;
  borderRadius?: number;
}

export function PinkButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  textSize = 14,
  height = 48,
  width,
  borderRadius = 9999,
}: PinkButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-[#FFDEE6] hover:bg-[#ffcddd]"
      : "bg-[#FFEDF1] hover:bg-[#ffe4ea]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height,
        fontSize: textSize,
        width: width ?? "100%",
        borderRadius,
      }}
      className={`font-cursive flex items-center justify-center gap-2 font-normal text-black transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

interface ModeTabsProps {
  mode: "take" | "upload";
  onChange: (mode: "take" | "upload") => void;
}

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  const tabs = ADD_PHOTO_LAYOUT.modeTabs;

  return (
    <div
      className="mx-auto flex"
      style={{
        width: tabs.width,
        height: tabs.height,
        gap: tabs.gap,
        borderRadius: tabs.radius,
        borderColor: tabs.borderColor,
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={() => onChange("take")}
        className="font-cursive flex flex-1 items-center justify-center border-0 bg-transparent p-0 text-center font-normal transition-colors border border-solid bg-white rounded-[6px]"
        style={{
          height: tabs.height,
          minHeight: tabs.height,
          maxHeight: tabs.height,
          fontSize: tabs.fontSize,
          color: mode === "take" ? tabs.selectedColor : tabs.unselectedColor,
        }}
      >
        Take Photos
      </button>
      <button
        type="button"
        onClick={() => onChange("upload")}
        className="font-cursive flex flex-1 items-center justify-center border-0 bg-transparent p-0 text-center font-normal transition-colors  border border-solid bg-white rounded-[6px]"
        style={{
          height: tabs.height,
          minHeight: tabs.height,
          maxHeight: tabs.height,
          fontSize: tabs.fontSize,
          color: mode === "upload" ? tabs.selectedColor : tabs.unselectedColor,
        }}
      >
        Upload
      </button>
    </div>
  );
}

interface CountdownPickerProps {
  value: 3 | 5 | 10;
  onChange: (value: 3 | 5 | 10) => void;
}

export function CountdownPicker({ value, onChange }: CountdownPickerProps) {
  const options = [3, 5, 10] as const;
  const countdown = ADD_PHOTO_LAYOUT.countdown;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-xs text-black">select countdown</p>
      <div className="flex" style={{ gap: countdown.gap }}>
        {options.map((seconds) => {
          const isSelected = value === seconds;

          return (
            <button
              key={seconds}
              type="button"
              onClick={() => onChange(seconds)}
              className="font-mono flex shrink-0 items-center justify-center rounded-full bg-white text-xs transition-colors"
              style={{
                width: countdown.size,
                height: countdown.size,
                aspectRatio: "1 / 1",
                color: isSelected ? countdown.selectedColor : countdown.unselectedColor,
              }}
            >
              {seconds}s
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ColorSwatchGridProps {
  label: string;
  colors: { id: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
  columns?: number;
}

export function ColorSwatchGrid({
  label,
  colors,
  selected,
  onSelect,
  columns = 4,
}: ColorSwatchGridProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs text-black">{label}</p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {colors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => onSelect(color.value)}
            aria-label={color.id}
            className={`aspect-square w-full rounded-full border-2 transition-transform ${
              selected === color.value
                ? "border-[#FFA8BD] scale-110"
                : "border-transparent"
            }`}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>
    </div>
  );
}
