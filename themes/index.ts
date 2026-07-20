export { theme, activeThemeId } from "@/themes/active";
export type { Theme, ThemeId } from "@/themes/types";

import { activeThemeId } from "@/themes/active";
import * as photoBoothLayout from "@/themes/photoBooth/layout";
import * as sinnoLayout from "@/themes/sinno/layout";
import { fonts as photoBoothFonts } from "@/themes/photoBooth/fonts";
import { fonts as sinnoFonts } from "@/themes/sinno/fonts";
import { getFrameById as getPhotoBoothFrameById } from "@/themes/photoBooth/frames";
import { getFrameById as getSinnoFrameById } from "@/themes/sinno/frames";

const layoutByTheme = {
  photoBooth: photoBoothLayout,
  sinno: sinnoLayout,
} as const;

const fontsByTheme = {
  photoBooth: photoBoothFonts,
  sinno: sinnoFonts,
} as const;

const getFrameByIdByTheme = {
  photoBooth: getPhotoBoothFrameById,
  sinno: getSinnoFrameById,
} as const;

/** Font loaders for the active theme — import in server layout only. */
export const themeFonts = fontsByTheme[activeThemeId];

export const getFrameById = getFrameByIdByTheme[activeThemeId];

export const {
  getAddPhotoThumbnailSizes,
  getCustomizeAvailableRowHeight,
  getCustomizeColumnWidths,
  getCustomizeControlsContentWidth,
  getCustomizePreviewMaxHeight,
  getCustomizeSwatchSize,
  getFrameSelectorLayout,
  getLandingPreviewSize,
  getPrintStripHeight,
  getPrintStripStartOffset,
  getPrintStripWidth,
  getPrinterTopInset,
  getSwatchBoxShadow,
  getUploadPreviewSize,
  getSwatchGridWidth,
  estimateCustomizeControlsHeight,
} = layoutByTheme[activeThemeId];

export type { AddPhotoThumbnailSize } from "@/themes/photoBooth/layout";
