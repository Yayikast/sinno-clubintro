"use client";

import { theme, getSwatchBoxShadow } from "@/themes";

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
  const colorInputValue = toColorInputValue(value);

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow: getSwatchBoxShadow(active),
          backgroundImage: `url(${theme.assets.colorPicker})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <input
        type="color"
        value={colorInputValue}
        onChange={(event) => onColorPick(event.target.value)}
        onInput={(event) => onColorPick(event.currentTarget.value)}
        aria-label="Color picker"
        className="color-picker-input absolute inset-0 m-0 cursor-pointer opacity-0"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          maxWidth: size,
          maxHeight: size,
          padding: 0,
          border: 0,
        }}
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
