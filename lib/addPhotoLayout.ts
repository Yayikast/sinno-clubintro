import { PAGE_LAYOUT } from "@/lib/pageLayout";

/** Add Photo — Take Photo layout tokens (393×852 frame, 329px content). */
export const ADD_PHOTO_LAYOUT = {
  contentWidth: PAGE_LAYOUT.contentWidth,
  /** Space between subtitle and Take Photos / Upload tabs. */
  headerToTabsGap: 40,
  modeTabs: {
    width: PAGE_LAYOUT.contentWidth,
    height: 35,
    buttonWidth: 160.5,
    gap: 8,
    fontSize: 14,
    padding: 8,
    radius: 6,
    selectedColor: "#000000",
    unselectedColor: "#CACACA",
    borderColor: "#FFDEE6",
  },
  countdown: {
    size: 32,
    gap: 12,
    selectedColor: "#000000",
    unselectedColor: "#CACACA",
  },
  thumbnail: {
    height: 70,
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
    background: "#202020",
  },
  takePhoto: {
    tabsToCountdownGap: 24,
    countdownToCaptureGap: 16,
    viewfinderToThumbnailsGap: 12,
    thumbnailsToDescriptionGap: 16,
    descriptionToFooterGap: 24,
  },
  upload: {
    /** Same preview size as landing frame picker (133.33 × 400 vertical). */
    previewWidth: 133.33,
    previewHeight: 400,
    placeholderBg: "#2a2a2a",
    overlayBg: "rgba(32, 32, 32, 0.8)",
    tabsToPreviewGap: 24,
    previewToHintGap: 32,
  },
} as const;

export function getUploadPreviewSize(aspectRatio: number): {
  width: number;
  height: number;
} {
  const height = ADD_PHOTO_LAYOUT.upload.previewHeight;
  const width =
    aspectRatio <= 400 / 1200
      ? ADD_PHOTO_LAYOUT.upload.previewWidth
      : height * aspectRatio;

  return { width, height };
}

export interface AddPhotoThumbnailSize {
  width: number;
  height: number;
}

/**
 * Thumbnails use h:w = 70:figmaWidth per slot at full size.
 * Scales to fit `maxRowWidth`; optionally scales up to fill the row width.
 */
export function getAddPhotoThumbnailSizes(
  frameId: keyof typeof ADD_PHOTO_LAYOUT.thumbnail.widthsByFrame,
  maxRowWidth: number = ADD_PHOTO_LAYOUT.viewfinder.width,
  fillWidth = false,
): AddPhotoThumbnailSize[] {
  const { thumbnail } = ADD_PHOTO_LAYOUT;
  const baseWidths = [...thumbnail.widthsByFrame[frameId]];
  const baseHeight = thumbnail.height;
  const gap = thumbnail.gap;
  const minHeight = 44;

  const thumbnailsWidth = baseWidths.reduce((sum, width) => sum + width, 0);
  const gapsWidth = Math.max(0, baseWidths.length - 1) * gap;
  const totalRowWidth = thumbnailsWidth + gapsWidth;
  const availableWidth = Math.max(0, maxRowWidth - gapsWidth);

  let scale = 1;
  if (fillWidth || totalRowWidth > maxRowWidth) {
    scale = availableWidth / thumbnailsWidth;
  }

  let height = baseHeight * scale;
  if (height < minHeight) {
    height = minHeight;
    scale = height / baseHeight;
  }

  const scaled = baseWidths.map((width) => width * scale);
  const rounded = scaled.map((width) => Math.floor(width * 100) / 100);
  const widthTotal = rounded.reduce((sum, width) => sum + width, 0);
  const targetWidth = Math.min(availableWidth, thumbnailsWidth * scale);
  const widthRemainder = Math.round((targetWidth - widthTotal) * 100) / 100;
  rounded[rounded.length - 1] += widthRemainder;

  return rounded.map((width) => ({ width, height }));
}

/** Total rendered width of a thumbnail row including gaps. */
export function getAddPhotoThumbnailRowWidth(
  sizes: AddPhotoThumbnailSize[],
  gap: number = ADD_PHOTO_LAYOUT.thumbnail.gap,
): number {
  if (sizes.length === 0) return 0;
  const thumbnailsWidth = sizes.reduce((sum, size) => sum + size.width, 0);
  const gapsWidth = Math.max(0, sizes.length - 1) * gap;
  return thumbnailsWidth + gapsWidth;
}
