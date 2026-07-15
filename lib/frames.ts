import type { ColorSwatch, FrameConfig, FrameId } from "@/types/photobooth";

export const FRAMES: FrameConfig[] = [
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
    slots: [
      { x: 0.085, y: 0.028, width: 0.83, height: 0.431 },
      { x: 0.085, y: 0.488, width: 0.83, height: 0.431 },
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
    slots: [
      { x: 0.085, y: 0.028, width: 0.83, height: 0.288 },
      { x: 0.085, y: 0.333, width: 0.83, height: 0.288 },
      { x: 0.085, y: 0.638, width: 0.83, height: 0.288 },
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
    slots: [
      { x: 0.085, y: 0.028, width: 0.83, height: 0.213 },
      { x: 0.085, y: 0.258, width: 0.83, height: 0.213 },
      { x: 0.085, y: 0.488, width: 0.83, height: 0.213 },
      { x: 0.085, y: 0.718, width: 0.83, height: 0.213 },
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
    captionY: 0.945,
    slots: [
      { x: 0.045, y: 0.028, width: 0.91, height: 0.431 },
      { x: 0.045, y: 0.488, width: 0.433, height: 0.431 },
      { x: 0.522, y: 0.488, width: 0.433, height: 0.431 },
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
    captionY: 0.945,
    slots: [
      { x: 0.045, y: 0.028, width: 0.433, height: 0.429 },
      { x: 0.522, y: 0.028, width: 0.433, height: 0.429 },
      { x: 0.045, y: 0.486, width: 0.433, height: 0.429 },
      { x: 0.522, y: 0.486, width: 0.433, height: 0.429 },
    ],
  },
];

export const DEFAULT_FRAME_ID: FrameId = "frame3";

export const DEFAULT_FRAME_COLOR = "#000000";
export const DEFAULT_TEXT_COLOR = "#FFFFFF";
export const DEFAULT_CAPTION = "moments of 2026";

export const FRAME_COLOR_SWATCHES: ColorSwatch[] = [
  { id: "black", label: "Black", value: "#000000" },
  { id: "gray", label: "Gray", value: "#9E9E9E" },
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "dark-red", label: "Dark Red", value: "#8B3A3A" },
  { id: "dark-teal", label: "Dark Teal", value: "#2F5F5F" },
  { id: "dark-green", label: "Dark Green", value: "#2D5016" },
  { id: "dark-brown", label: "Dark Brown", value: "#5C4033" },
  { id: "pink", label: "Pink", value: "#FFA8BD" },
  { id: "light-pink", label: "Light Pink", value: "#FFDEE6" },
];

export const TEXT_COLOR_SWATCHES: ColorSwatch[] = [
  { id: "black", label: "Black", value: "#000000" },
  { id: "gray", label: "Gray", value: "#9E9E9E" },
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "dark-red", label: "Dark Red", value: "#8B3A3A" },
  { id: "dark-teal", label: "Dark Teal", value: "#2F5F5F" },
  { id: "dark-green", label: "Dark Green", value: "#2D5016" },
  { id: "dark-brown", label: "Dark Brown", value: "#5C4033" },
  { id: "peach", label: "Peach", value: "#FFCBA4" },
  { id: "light-blue", label: "Light Blue", value: "#87CEEB" },
  { id: "light-green", label: "Light Green", value: "#90EE90" },
  { id: "light-pink", label: "Light Pink", value: "#FFB6C1" },
];

export function getFrameById(id: FrameId): FrameConfig {
  const frame = FRAMES.find((item) => item.id === id);
  if (!frame) {
    return FRAMES[2];
  }
  return frame;
}
