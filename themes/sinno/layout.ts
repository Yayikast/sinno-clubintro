import { colors } from "@/themes/sinno/colors";
import type {
  ThemeAddPhotoLayout,
  ThemeCustomizeLayout,
  ThemeLandingLayout,
  ThemeLayout,
  ThemePageLayout,
  ThemePrintLayout,
} from "@/themes/types";
import type { FrameId } from "@/types/photobooth";

const page: ThemePageLayout = {
  frameWidth: 393,
  paddingX: 32,
  paddingY: 56,
  contentWidth: 329,
  primaryButton: {
    textSize: 14,
    width: 133.33,
    height: 35,
    radius: 6,
  },
  actionFooter: {
    hintToButtonGap: 24,
  },
};

const landing: ThemeLandingLayout = {
  frameWidth: page.frameWidth,
  frameHeight: 852,
  paddingX: page.paddingX,
  paddingY: page.paddingY,
  headerToPreviewGap: 24,
  previewToSelectorGap: 20,
  selectorToButtonGap: 32,
  previewWidth: 133.33,
  previewHeight: 400,
  selectorHeight: 50,
  selectorSelectedSize: 66,
  selectorSelectedBg: colors.landing.selectorSelectedBg,
  selectorUnselectedOpacity: colors.landing.selectorUnselectedOpacity,
  selectorSelectedRadius: 4,
  selectorGap: 8,
};

const addPhoto: ThemeAddPhotoLayout = {
  contentWidth: page.contentWidth,
  headerToTabsGap: 40,
  modeTabs: {
    width: page.contentWidth,
    height: 35,
    gap: 8,
    fontSize: 14,
    radius: 6,
    pillInset: 2,
  },
  countdown: {
    size: 32,
    gap: 12,
  },
  thumbnail: {
    height: 70,
    maxRowHeight: 80,
    gap: 8,
    widthsByFrame: {
      frame1: [45, 45],
      frame2: [70, 70, 70],
      frame3: [96, 96, 96, 96],
      frame4: [94, 45, 45],
      frame5: [45, 45, 45, 45],
    },
  },
  viewfinder: {
    width: 288,
    height: 329,
    background: colors.viewfinder,
  },
  takePhoto: {
    tabsToCountdownGap: 24,
    countdownToCaptureGap: 16,
    viewfinderToThumbnailsGap: 12,
  },
  upload: {
    previewWidth: 133.33,
    previewHeight: 400,
    placeholderBg: colors.placeholder,
    overlayBg: colors.overlay,
    tabsToPreviewGap: 24,
    previewToHintGap: 32,
  },
};

const customize: ThemeCustomizeLayout = {
  contentWidth: page.contentWidth,
  headerToTitleGap: 40,
  titleSize: 24,
  titleToContentGap: 40,
  contentToFooterGap: 40,
  columnGap: 16,
  previewColumnShare: 0.42,
  sectionGap: 16,
  labelToSwatchesGap: 8,
  swatchMinSize: 30,
  swatchGap: 8,
  inputRadius: 12,
  inputBorder: colors.customize.inputBorder,
  inputPaddingX: 8,
  inputPaddingY: 4,
  inputFontSize: 14,
  inputMinHeight: 32,
};

const print: ThemePrintLayout = {
  contentWidth: page.contentWidth,
  headerToTitleGap: customize.headerToTitleGap,
  titleSize: customize.titleSize,
  titleToContentGap: customize.titleToContentGap,
  printerWidth: 217,
  printerTopHeight: 22,
  printerBottomHeight: 22,
  printerAssemblyHeight: 24,
  stripSlotTop: 16,
  printerTopBleed: 0,
  printerTopOffset: 0,
  printerBottomOffset: 2,
  zIndex: {
    printerBottom: 10,
    strip: 20,
    printerTop: 30,
  },
  printingDurationMs: 2500,
};

export const layout: ThemeLayout = {
  page,
  landing,
  addPhoto,
  customize,
  print,
};

export function getFrameSelectorLayout(
  frameCount: number,
  availableWidth: number = page.contentWidth,
): {
  size: number;
  gap: number;
  iconHeight: number;
  radius: number;
} {
  const { selectorSelectedSize, selectorGap, selectorHeight, selectorSelectedRadius } =
    landing;
  const totalWidth =
    frameCount * selectorSelectedSize + Math.max(0, frameCount - 1) * selectorGap;
  const scale = totalWidth > availableWidth ? availableWidth / totalWidth : 1;

  return {
    size: selectorSelectedSize * scale,
    gap: selectorGap * scale,
    iconHeight: selectorHeight * scale,
    radius: selectorSelectedRadius * scale,
  };
}

export function getLandingPreviewSize(aspectRatio: number): {
  width: number;
  height: number;
} {
  const height = landing.previewHeight;
  const width =
    aspectRatio <= 400 / 1200 ? landing.previewWidth : height * aspectRatio;

  return { width, height };
}

export function getUploadPreviewSize(aspectRatio: number): {
  width: number;
  height: number;
} {
  const height = addPhoto.upload.previewHeight;
  const width =
    aspectRatio <= 400 / 1200 ? addPhoto.upload.previewWidth : height * aspectRatio;

  return { width, height };
}

export interface AddPhotoThumbnailSize {
  width: number;
  height: number;
}

export function getAddPhotoThumbnailSizes(
  frameId: FrameId,
  maxRowWidth: number = addPhoto.viewfinder.width,
  fillWidth = false,
  maxRowHeight: number = addPhoto.thumbnail.maxRowHeight,
): AddPhotoThumbnailSize[] {
  const { thumbnail } = addPhoto;
  const baseWidths = [...thumbnail.widthsByFrame[frameId]];
  const baseHeight = thumbnail.height;
  const gap = thumbnail.gap;

  const thumbnailsWidth = baseWidths.reduce((sum, width) => sum + width, 0);
  const gapsWidth = Math.max(0, baseWidths.length - 1) * gap;
  const availableWidth = Math.max(0, maxRowWidth - gapsWidth);
  const scaleWidth = availableWidth / thumbnailsWidth;
  const scaleHeight = maxRowHeight / baseHeight;

  let scale = Math.min(scaleWidth, scaleHeight);
  if (!fillWidth) {
    scale = Math.min(scale, 1);
  }

  const height = baseHeight * scale;
  const scaled = baseWidths.map((width) => width * scale);
  const rounded = scaled.map((width) => Math.floor(width * 100) / 100);
  const widthTotal = rounded.reduce((sum, width) => sum + width, 0);
  const targetWidth = thumbnailsWidth * scale;
  const widthRemainder = Math.round((targetWidth - widthTotal) * 100) / 100;
  rounded[rounded.length - 1] += widthRemainder;

  return rounded.map((width) => ({ width, height }));
}

export function getCustomizeColumnWidths(
  contentWidth: number = customize.contentWidth,
): {
  previewWidth: number;
  controlsWidth: number;
} {
  const previewWidth = Math.round(contentWidth * customize.previewColumnShare);
  const controlsWidth = contentWidth - previewWidth - customize.columnGap;
  return { previewWidth, controlsWidth: Math.max(0, controlsWidth) };
}

export function getCustomizeSwatchSize(
  contentWidth: number = customize.contentWidth,
): number {
  const { swatchMinSize, swatchGap } = customize;
  const maxPerRow = Math.max(
    1,
    Math.floor((contentWidth + swatchGap) / (swatchMinSize + swatchGap)),
  );
  const rowWidth = maxPerRow * swatchMinSize + (maxPerRow - 1) * swatchGap;
  if (rowWidth <= contentWidth) {
    return swatchMinSize;
  }
  const fitSize = (contentWidth - (maxPerRow - 1) * swatchGap) / maxPerRow;
  return Math.max(swatchMinSize, Math.floor(fitSize));
}

export function getSwatchGridWidth(
  swatchCount: number,
  containerWidth: number,
  swatchSize: number,
): number {
  const gap = customize.swatchGap;
  const perRow = Math.max(
    1,
    Math.floor((containerWidth + gap) / (swatchSize + gap)),
  );
  const columns = Math.min(swatchCount, perRow);
  return columns * swatchSize + Math.max(0, columns - 1) * gap;
}

export function getCustomizeControlsContentWidth(
  frameSwatchCount: number,
  textSwatchCount: number,
  contentWidth: number = customize.contentWidth,
): { width: number; swatchSize: number } {
  const { controlsWidth } = getCustomizeColumnWidths(contentWidth);
  const swatchSize = getCustomizeSwatchSize(controlsWidth);
  const frameGridWidth = getSwatchGridWidth(frameSwatchCount, controlsWidth, swatchSize);
  const textGridWidth = getSwatchGridWidth(textSwatchCount, controlsWidth, swatchSize);

  return {
    width: Math.max(frameGridWidth, textGridWidth),
    swatchSize,
  };
}

function getSwatchRowCount(
  count: number,
  contentWidth: number,
  swatchSize: number,
): number {
  const gap = customize.swatchGap;
  const perRow = Math.max(
    1,
    Math.floor((contentWidth + gap) / (swatchSize + gap)),
  );
  return Math.ceil(count / perRow);
}

function getSwatchGridHeight(
  count: number,
  contentWidth: number,
  swatchSize: number,
): number {
  const gap = customize.swatchGap;
  const rows = getSwatchRowCount(count, contentWidth, swatchSize);
  return rows * swatchSize + Math.max(0, rows - 1) * gap;
}

export function estimateCustomizeControlsHeight(
  frameSwatchCount: number,
  textSwatchCount: number,
  contentWidth: number,
  swatchSize = getCustomizeSwatchSize(contentWidth),
): number {
  const labelHeight = 12;
  const inputHeight = customize.inputMinHeight;

  return (
    labelHeight +
    customize.labelToSwatchesGap +
    getSwatchGridHeight(frameSwatchCount, contentWidth, swatchSize) +
    customize.sectionGap +
    labelHeight +
    customize.labelToSwatchesGap +
    getSwatchGridHeight(textSwatchCount, contentWidth, swatchSize) +
    customize.labelToSwatchesGap +
    inputHeight
  );
}

export function getCustomizeAvailableRowHeight(contentHeight: number): number {
  const reservedInMain =
    customize.headerToTitleGap +
    customize.titleSize * 1.2 +
    customize.titleToContentGap +
    customize.contentToFooterGap;

  return Math.max(72, contentHeight - reservedInMain);
}

export function getCustomizePreviewMaxHeight(
  contentHeight: number,
  controlsHeight: number,
): number {
  const availableRowHeight = getCustomizeAvailableRowHeight(contentHeight);

  if (controlsHeight <= availableRowHeight) {
    return availableRowHeight;
  }

  return Math.max(72, availableRowHeight);
}

export function getSwatchBoxShadow(selected: boolean): string {
  const { swatchStroke } = colors.customize;
  const inner = `inset 0 0 0 ${swatchStroke.innerWidth}px ${swatchStroke.innerColor}`;

  if (!selected) {
    return inner;
  }

  const outer = `0 0 0 ${swatchStroke.selectedOuterWidth}px ${swatchStroke.selectedOuterColor}`;
  const overlay = `0 0 0 ${swatchStroke.selectedOuterWidth}px ${swatchStroke.selectedOverlayColor}`;
  return `${inner}, ${outer}, ${overlay}`;
}

export function getPrintStripWidth(
  contentWidth: number = print.contentWidth,
): number {
  return Math.round(contentWidth * customize.previewColumnShare);
}

export function getPrintStripHeight(stripWidth: number, aspectRatio: number): number {
  return Math.round(stripWidth / aspectRatio);
}

export function getPrinterTopInset(
  offset: number = print.printerTopOffset,
  bleed: number = print.printerTopBleed,
): number {
  return bleed + Math.max(0, -offset);
}

export function getPrintStripStartOffset(stripHeight: number): number {
  return -stripHeight;
}
