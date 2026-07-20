"use client";

import { theme, getSwatchBoxShadow } from "@/themes";
import { COLOR_PICKER_SWATCH_ID, getSwatchPreviewStyle } from "@/lib/frameFill";
import { ColorWheelPicker, isPresetSwatchValue } from "@/components/ui/ColorWheelPicker";

interface ColorSwatchGridProps {
  label: string;
  colors: { id: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
  swatchSize?: number;
  swatchGap?: number;
  showLabel?: boolean;
}

export function ColorSwatchGrid({
  label,
  colors,
  selected,
  onSelect,
  swatchSize = theme.layout.customize.swatchMinSize,
  swatchGap = theme.layout.customize.swatchGap,
  showLabel = true,
}: ColorSwatchGridProps) {
  return (
    <div
      className="flex w-fit max-w-full flex-col"
      style={{ gap: theme.layout.customize.labelToSwatchesGap }}
    >
      {showLabel ? <p className="font-mono text-xs text-black">{label}</p> : null}
      <div className="flex w-fit max-w-full flex-wrap" style={{ gap: swatchGap }}>
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
