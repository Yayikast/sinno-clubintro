import type { FrameColorOption, LayoutConfig } from "@/types/photobooth";

export const LAYOUTS: LayoutConfig[] = [
  {
    id: "vertical-3",
    label: "Classic 3",
    description: "3 photos stacked vertically",
    aspectRatio: "6:2",
    photoCount: 3,
    arrangement: "vertical",
    cols: 1,
    rows: 3,
  },
  {
    id: "vertical-4",
    label: "Classic 4",
    description: "4 photos stacked vertically",
    aspectRatio: "6:2",
    photoCount: 4,
    arrangement: "vertical",
    cols: 1,
    rows: 4,
  },
  {
    id: "grid-4",
    label: "Grid 4",
    description: "4 photos in a 2×2 grid",
    aspectRatio: "6:5",
    photoCount: 4,
    arrangement: "grid-2x2",
    cols: 2,
    rows: 2,
  },
];

export const FRAME_COLORS: FrameColorOption[] = [
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "black", label: "Black", value: "#1A1A1A" },
  { id: "blush", label: "Blush", value: "#F4C2C2" },
  { id: "sage", label: "Sage", value: "#B5C9B7" },
  { id: "navy", label: "Navy", value: "#1E3A5F" },
  { id: "gold", label: "Gold", value: "#D4A853" },
];

export const DEFAULT_FRAME_COLOR = FRAME_COLORS[0].value;

export function getLayoutById(id: string): LayoutConfig | undefined {
  return LAYOUTS.find((layout) => layout.id === id);
}

export function getAspectRatioValue(aspectRatio: LayoutConfig["aspectRatio"]): number {
  if (aspectRatio === "6:2") return 3;
  return 6 / 5;
}
