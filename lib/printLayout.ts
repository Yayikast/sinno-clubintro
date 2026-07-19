import { CUSTOMIZE_LAYOUT } from "@/lib/customizeLayout";
import { PAGE_LAYOUT } from "@/lib/pageLayout";

/** Print page layout tokens from Figma (393×852 frame). */
export const PRINT_LAYOUT = {
  contentWidth: PAGE_LAYOUT.contentWidth,
  headerToTitleGap: CUSTOMIZE_LAYOUT.headerToTitleGap,
  titleSize: CUSTOMIZE_LAYOUT.titleSize,
  titleToContentGap: CUSTOMIZE_LAYOUT.titleToContentGap,
  /** Printer chrome from `figma/assets/printer-*.svg`. */
  printerWidth: 217,
  printerTopHeight: 22,
  printerBottomHeight: 22,
  /** Combined printer height from `printer.svg`. */
  printerAssemblyHeight: 24,
  /** Bottom of the slot opening in `printer-top.svg` / `printer.svg`. */
  stripSlotTop: 16,
  /** Extra space above printer-top so the SVG shadow is not clipped. */
  printerTopBleed: 0,
  /** `printer-top.svg` sits at y=0 in `printer.svg`. */
  printerTopOffset: 0,
  /** Nudge `printer-bottom.svg` down to match `printer.svg` overlap. */
  printerBottomOffset: 2,
  /** Layer order: bottom (back) → strip → top (front). */
  zIndex: {
    printerBottom: 10,
    strip: 20,
    printerTop: 30,
  },
  printingDurationMs: 2500,
} as const;

/** Strip preview width — same as Customize step. */
export function getPrintStripWidth(
  contentWidth: number = PRINT_LAYOUT.contentWidth,
): number {
  return Math.round(contentWidth * CUSTOMIZE_LAYOUT.previewColumnShare);
}

/** Estimated strip height from frame aspect ratio (width / height). */
export function getPrintStripHeight(stripWidth: number, aspectRatio: number): number {
  return Math.round(stripWidth / aspectRatio);
}

/** Padding above printer chrome (bleed + negative offset compensation). */
export function getPrinterTopInset(
  offset: number = PRINT_LAYOUT.printerTopOffset,
  bleed: number = PRINT_LAYOUT.printerTopBleed,
): number {
  return bleed + Math.max(0, -offset);
}

/** Start Y offset — strip fully retracted inside the printer slot. */
export function getPrintStripStartOffset(stripHeight: number): number {
  return -stripHeight;
}
