"use client";

import { CUSTOMIZE_LAYOUT, getSwatchBoxShadow } from "@/lib/customizeLayout";
import { COLOR_PICKER_SWATCH_ID, getSwatchPreviewStyle } from "@/lib/frameFill";
import { ColorWheelPicker, isPresetSwatchValue } from "@/components/ui/ColorWheelPicker";

interface ColorSwatchGridProps {
  label: string;
  colors: { id: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
  columns?: number;
  swatchSize?: number;
  swatchGap?: number;
  showLabel?: boolean;
}

export function ColorSwatchGrid({
  label,
  colors,
  selected,
  onSelect,
  columns = 4,
  swatchSize = 32,
  swatchGap = 8,
  showLabel = true,
}: ColorSwatchGridProps) {
  return (
    <div
      className="flex flex-col"
      style={{ gap: CUSTOMIZE_LAYOUT.labelToSwatchesGap }}
    >
      {showLabel ? <p className="font-mono text-xs text-black">{label}</p> : null}
      <div
        className="grid"
        style={{
          gap: swatchGap,
          gridTemplateColumns: `repeat(${columns}, ${swatchSize}px)`,
        }}
      >
        {colors.map((color) => {
          if (color.id === "picker" || color.value === COLOR_PICKER_SWATCH_ID) {
            return (
              <ColorWheelPicker
                key={color.id}
                size={swatchSize}
                value={selected}
                active={!isPresetSwatchValue(colors, selected)}
                onColorPick={onSelect}
              />
            );
          }

          const isSelected = selected === color.value;

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onSelect(color.value)}
              aria-label={color.id}
              aria-pressed={isSelected}
              className="m-0 shrink-0 rounded-full border-0 p-0"
              style={{
                width: swatchSize,
                height: swatchSize,
                minWidth: swatchSize,
                minHeight: swatchSize,
                maxWidth: swatchSize,
                maxHeight: swatchSize,
                boxShadow: getSwatchBoxShadow(isSelected),
                ...getSwatchPreviewStyle(color.value),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
