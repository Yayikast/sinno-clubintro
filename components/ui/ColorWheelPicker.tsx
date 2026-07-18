"use client";

import { useRef } from "react";
import { getSwatchBoxShadow } from "@/lib/customizeLayout";
import { COLOR_PICKER_PATH } from "@/lib/frameFill";

function toColorInputValue(value: string): string {
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value.toLowerCase();
  }

  if (/^#[0-9A-Fa-f]{3}$/.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return "#000000";
}

interface ColorWheelPickerProps {
  size?: number;
  active?: boolean;
  value?: string;
  onColorPick: (color: string) => void;
}

export function ColorWheelPicker({
  size = 32,
  active = false,
  value = "#000000",
  onColorPick,
}: ColorWheelPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const colorInputValue = toColorInputValue(value);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <button
        type="button"
        aria-label="Color picker"
        aria-pressed={active}
        onClick={() => inputRef.current?.click()}
        className="m-0 shrink-0 rounded-full border-0 p-0"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          maxWidth: size,
          maxHeight: size,
          boxShadow: getSwatchBoxShadow(active),
          backgroundImage: `url(${COLOR_PICKER_PATH})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <input
        ref={inputRef}
        type="color"
        value={colorInputValue}
        onChange={(event) => onColorPick(event.target.value)}
        className="pointer-events-none absolute left-0 top-0 opacity-0"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          padding: 0,
          border: 0,
        }}
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}

export function isPresetSwatchValue(
  colors: { id: string; value: string }[],
  value: string,
): boolean {
  return colors.some((color) => color.id !== "picker" && color.value === value);
}
