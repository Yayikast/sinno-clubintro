import type { ThemeColors } from "@/themes/types";

export const colors: ThemeColors = {
  background: "#FFF5F7",
  foreground: "#000000",
  button: {
    primary: "#FFDEE6",
    primaryHover: "#ffcddd",
    secondary: "#FFEDF1",
    secondaryHover: "#ffe4ea",
  },
  placeholder: "#202020",
  viewfinder: "#202020",
  overlay: "rgba(32, 32, 32, 0.8)",
  emptySlot: "#FFDEE6",
  modeTabs: {
    trackBg: "#FFEDF1",
    pillBg: "#FFFFFF",
    selectedTextColor: "#000000",
    unselectedTextColor: "rgba(0, 0, 0, 0.45)",
  },
  countdown: {
    selectedBg: "#FFFFFF",
    unselectedBg: "#FFEDF1",
    selectedColor: "#000000",
    unselectedColor: "rgba(0, 0, 0, 0.45)",
  },
  landing: {
    selectorSelectedBg: "rgba(255, 255, 255, 0.2)",
    selectorUnselectedOpacity: 0.45,
  },
  customize: {
    inputBorder: "rgba(0, 0, 0, 0.3)",
    swatchStroke: {
      innerColor: "rgba(0, 0, 0, 0.2)",
      innerWidth: 0.5,
      selectedOuterColor: "#FFA8BD",
      selectedOverlayColor: "rgba(0, 0, 0, 0.1)",
      selectedOuterWidth: 2,
    },
  },
};
