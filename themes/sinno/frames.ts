import { COLOR_PICKER_SWATCH_ID } from "@/lib/colorSwatch";
import { frameList, getFrameById } from "@/themes/photoBooth/frames";
import type { ColorSwatch } from "@/types/photobooth";
import type { ThemeFrameDefaults, ThemeFrames } from "@/themes/types";

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
  { id: "purple-light", label: "Purple Light", value: "#EED6F7" },
  { id: "purple-light-2", label: "Purple Light 2", value: "#F8E6FF" },
  { id: "purple-bg", label: "Purple Bg", value: "#F9EBFF" },
  { id: "pattern1", label: "Pattern 1", value: "pattern:frame1.webp" },
  { id: "pattern2", label: "Pattern 2", value: "pattern:frame2.jpeg" },
  { id: "pattern3", label: "Pattern 3", value: "pattern:frame3.webp" },
  { id: "pattern4", label: "Pattern 4", value: "pattern:frame4.webp" },
  { id: "pattern5", label: "Pattern 5", value: "pattern:frame5.png" },
];

const TEXT_COLOR_SWATCHES: ColorSwatch[] = [
  { id: "picker", label: "Color picker", value: COLOR_PICKER_SWATCH_ID },
  { id: "black", label: "Black", value: "#000000" },
  { id: "gray", label: "Gray", value: "#CACACA" },
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "purple-dark", label: "Purple Dark", value: "#D4A0E7" },
  { id: "purple-light", label: "Purple Light", value: "#EED6F7" },
];

export const frames: ThemeFrames = {
  list: frameList,
  defaults,
  frameColorSwatches: FRAME_COLOR_SWATCHES,
  textColorSwatches: TEXT_COLOR_SWATCHES,
  getFrameById,
};

export { getFrameById };
