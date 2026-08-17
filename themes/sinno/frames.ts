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
    svgPath: "/sinno/frames/Frame1.svg",
    iconPath: "/sinno/frames/Frame1.svg",
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
    svgPath: "/sinno/frames/Frame2.svg",
    iconPath: "/sinno/frames/Frame2.svg",
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
    svgPath: "/sinno/frames/Frame3.svg",
    iconPath: "/sinno/frames/Frame3.svg",
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
    svgPath: "/sinno/frames/Frame4.svg",
    iconPath: "/sinno/frames/Frame4.svg",
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
    svgPath: "/sinno/frames/Frame5.svg",
    iconPath: "/sinno/frames/Frame5.svg",
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
  caption: "SINNO <3",
};

const FRAME_COLOR_SWATCHES: ColorSwatch[] = [
  { id: "picker", label: "Color picker", value: COLOR_PICKER_SWATCH_ID },
  { id: "black", label: "Black", value: "#000000" },
  { id: "gray", label: "Gray", value: "#CACACA" },
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "purple-dark", label: "Purple Dark", value: "#D4A0E7" },
  { id: "pattern1", label: "Pattern 1", value: "pattern:frame1.webp" },
  { id: "pattern2", label: "Pattern 2", value: "pattern:frame2.jpeg" },
  { id: "pattern3", label: "Pattern 3", value: "pattern:frame3.webp" },
  { id: "pattern4", label: "Pattern 4", value: "pattern:frame4.webp" },
  { id: "pattern5", label: "Pattern 5", value: "pattern:frame5.png" },
  { id: "overlay-frame6", label: "Overlay 1", value: "overlay:frame6" },
  { id: "overlay-frame7", label: "Overlay 2", value: "overlay:frame7" },
];

const TEXT_COLOR_SWATCHES: ColorSwatch[] = [
  { id: "picker", label: "Color picker", value: COLOR_PICKER_SWATCH_ID },
  { id: "black", label: "Black", value: "#000000" },
  { id: "gray", label: "Gray", value: "#888888" },
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "purple", label: "Purple", value: "#D1A2E3" },
  { id: "red", label: "Red", value: "#960C0C" },
  { id: "green", label: "Green", value: "#076422" },
  { id: "blue", label: "Blue", value: "#054D87" },
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
