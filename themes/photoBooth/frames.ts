import { COLOR_PICKER_SWATCH_ID } from "@/lib/colorSwatch";
import type { ColorSwatch, FrameConfig, FrameId } from "@/types/photobooth";
import type { ThemeFrameDefaults, ThemeFrames } from "@/themes/types";

const FRAMES: FrameConfig[] = [
  {
    id: "frame1",
    label: "2 Photos",
    photoCount: 2,
    cols: 1,
    rows: 2,
    aspectRatio: 400 / 1200,
    svgPath: "/figma/frames/Frame1.svg",
    iconPath: "/figma/frames/Frame1.svg",
    captionY: 0.945,
    captionYOffset: 0,
    slots: [
      { x: 0.085, y: 0.0283, width: 0.83, height: 0.4308 },
      { x: 0.085, y: 0.4875, width: 0.83, height: 0.4308 },
    ],
  },
  {
    id: "frame2",
    label: "3 Photos",
    photoCount: 3,
    cols: 1,
    rows: 3,
    aspectRatio: 400 / 1200,
    svgPath: "/figma/frames/Frame2.svg",
    iconPath: "/figma/frames/Frame2.svg",
    captionY: 0.945,
    captionYOffset: 0,
    slots: [
      { x: 0.085, y: 0.0283, width: 0.83, height: 0.2767 },
      { x: 0.085, y: 0.3333, width: 0.83, height: 0.2767 },
      { x: 0.085, y: 0.6383, width: 0.83, height: 0.2767 },
    ],
  },
  {
    id: "frame3",
    label: "4 Photos",
    photoCount: 4,
    cols: 1,
    rows: 4,
    aspectRatio: 400 / 1200,
    svgPath: "/figma/frames/Frame3.svg",
    iconPath: "/figma/frames/Frame3.svg",
    captionY: 0.945,
    captionYOffset: 0,
    slots: [
      { x: 0.085, y: 0.0283, width: 0.83, height: 0.2008 },
      { x: 0.085, y: 0.2575, width: 0.83, height: 0.2008 },
      { x: 0.085, y: 0.4867, width: 0.83, height: 0.2008 },
      { x: 0.085, y: 0.7158, width: 0.83, height: 0.2008 },
    ],
  },
  {
    id: "frame4",
    label: "1 + 2 Photos",
    photoCount: 3,
    cols: 2,
    rows: 2,
    aspectRatio: 762 / 1200,
    svgPath: "/figma/frames/Frame4.svg",
    iconPath: "/figma/frames/Frame4.svg",
    captionY: 0.934,
    captionFontSizeScale: 0.62,
    slots: [
      { x: 0.0446, y: 0.0283, width: 0.9107, height: 0.4308 },
      { x: 0.0446, y: 0.4875, width: 0.433, height: 0.4308 },
      { x: 0.5223, y: 0.4875, width: 0.433, height: 0.4308 },
    ],
  },
  {
    id: "frame5",
    label: "2×2 Grid",
    photoCount: 4,
    cols: 2,
    rows: 2,
    aspectRatio: 762 / 1200,
    svgPath: "/figma/frames/Frame5.svg",
    iconPath: "/figma/frames/Frame5.svg",
    captionY: 0.934,
    captionFontSizeScale: 0.62,
    slots: [
      { x: 0.0446, y: 0.0283, width: 0.4331, height: 0.4292 },
      { x: 0.5223, y: 0.0283, width: 0.4331, height: 0.4292 },
      { x: 0.0446, y: 0.4858, width: 0.4331, height: 0.4292 },
      { x: 0.5223, y: 0.4858, width: 0.4331, height: 0.4292 },
    ],
  },
];

export const defaults: ThemeFrameDefaults = {
  frameId: "frame3",
  frameColor: "#000000",
  textColor: "#FFFFFF",
  caption: "moments of 2026",
};

const FRAME_COLOR_SWATCHES: ColorSwatch[] = [
  { id: "picker", label: "Color picker", value: COLOR_PICKER_SWATCH_ID },
  { id: "black", label: "Black", value: "#000000" },
  { id: "gray", label: "Gray", value: "#9E9E9E" },
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "dark-red", label: "Dark Red", value: "#8B3A3A" },
  { id: "dark-navy", label: "Dark Navy", value: "#1E3A5F" },
  { id: "dark-green", label: "Dark Green", value: "#2D5016" },
  { id: "dark-brown", label: "Dark Brown", value: "#5C4033" },
  { id: "pink", label: "Pink", value: "#FFA8BD" },
  { id: "light-pink", label: "Light Pink", value: "#FFDEE6" },
  { id: "pattern1", label: "Pattern 1", value: "pattern:pattern1.png" },
  { id: "pattern2", label: "Pattern 2", value: "pattern:pattern2.png" },
  { id: "pattern3", label: "Pattern 3", value: "pattern:pattern3.png" },
  { id: "pattern4", label: "Pattern 4", value: "pattern:pattern4.png" },
  { id: "pattern5", label: "Pattern 5", value: "pattern:pattern5.png" },
  { id: "pattern6", label: "Pattern 6", value: "pattern:pattern6.png" },
];

const TEXT_COLOR_SWATCHES: ColorSwatch[] = [
  { id: "picker", label: "Color picker", value: COLOR_PICKER_SWATCH_ID },
  { id: "black", label: "Black", value: "#000000" },
  { id: "gray", label: "Gray", value: "#9E9E9E" },
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "dark-red", label: "Dark Red", value: "#8B3A3A" },
  { id: "dark-navy", label: "Dark Navy", value: "#1E3A5F" },
  { id: "dark-green", label: "Dark Green", value: "#2D5016" },
  { id: "dark-brown", label: "Dark Brown", value: "#5C4033" },
  { id: "peach", label: "Peach", value: "#FFCBA4" },
  { id: "light-blue", label: "Light Blue", value: "#87CEEB" },
  { id: "light-green", label: "Light Green", value: "#90EE90" },
  { id: "light-pink", label: "Light Pink", value: "#FFB6C1" },
];

export const frameList = FRAMES;

export function getFrameById(id: FrameId): FrameConfig {
  const frame = FRAMES.find((item) => item.id === id);
  if (!frame) {
    return FRAMES[2];
  }
  return frame;
}

export const frames: ThemeFrames = {
  list: FRAMES,
  defaults,
  frameColorSwatches: FRAME_COLOR_SWATCHES,
  textColorSwatches: TEXT_COLOR_SWATCHES,
  getFrameById,
};
