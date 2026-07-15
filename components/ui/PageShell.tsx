"use client";

import Image from "next/image";
import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  footer?: ReactNode;
}

export function PageShell({
  children,
  showBack = false,
  onBack,
  footer,
}: PageShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/figma/decorations/background.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      <header className="safe-top relative px-4 pb-2 pt-4">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center"
          >
            <Image src="/figma/icons/back.svg" alt="" width={20} height={20} />
          </button>
        ) : null}

        <div className="text-center">
          <h1 className="font-cursive text-4xl font-bold text-black">PhotoBooth</h1>
          <p className="font-mono text-xs text-black">- capture the moments -</p>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        {children}
      </main>

      {footer ? (
        <footer className="safe-bottom px-4 py-4">{footer}</footer>
      ) : null}
    </div>
  );
}

interface PinkButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}

export function PinkButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
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
      className={`font-cursive flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-xl font-bold text-black transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
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
  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange("take")}
        className={`font-cursive rounded-2xl border border-[#FFDEE6] bg-white px-4 py-3 text-lg font-bold transition-colors ${
          mode === "take" ? "text-black" : "text-[#CACACA]"
        }`}
      >
        Take Photos
      </button>
      <button
        type="button"
        onClick={() => onChange("upload")}
        className={`font-cursive rounded-2xl border border-[#FFDEE6] bg-white px-4 py-3 text-lg font-bold transition-colors ${
          mode === "upload" ? "text-black" : "text-[#CACACA]"
        }`}
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

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-xs text-black">select countdown</p>
      <div className="flex gap-3">
        {options.map((seconds) => (
          <button
            key={seconds}
            type="button"
            onClick={() => onChange(seconds)}
            className={`font-mono flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm transition-colors ${
              value === seconds ? "text-black" : "text-[#CACACA]"
            }`}
          >
            {seconds}s
          </button>
        ))}
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
