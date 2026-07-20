import type { ThemeColors } from "@/themes/types";

export const colors: ThemeColors = {
  background: "#F9EBFF",
  foreground: "#000000",
  button: {
    primary: "#EED6F7",
    primaryHover: "#D4A0E7",
    secondary: "#F8E6FF",
    secondaryHover: "#EED6F7",
  },
  placeholder: "#202020",
  viewfinder: "#202020",
  overlay: "rgba(32, 32, 32, 0.8)",
  emptySlot: "#F8E6FF",
  modeTabs: {
    trackBg: "#F8E6FF",
    pillBg: "#FFFFFF",
    selectedTextColor: "#000000",
    unselectedTextColor: "#CACACA",
  },
  countdown: {
    selectedBg: "#FFFFFF",
    unselectedBg: "#F8E6FF",
    selectedColor: "#000000",
    unselectedColor: "#CACACA",
  },
  landing: {
    selectorSelectedBg: "rgba(255, 255, 255, 0.35)",
    selectorUnselectedOpacity: 0.45,
  },
  customize: {
    inputBorder: "rgba(0, 0, 0, 0.3)",
    swatchStroke: {
      innerColor: "rgba(0, 0, 0, 0.2)",
      innerWidth: 0.5,
      selectedOuterColor: "#D4A0E7",
      selectedOverlayColor: "rgba(0, 0, 0, 0.1)",
      selectedOuterWidth: 2,
    },
  },
};

/** Documented gradient — use when adding gradient UI (see DESIGN.md). */
export const purpleGradient = "linear-gradient(90deg, #D4A0E7 0%, #EED6F7 100%)";
