/** Add Photo — Take Photo layout tokens (393×852 frame, 329px content). */
export const ADD_PHOTO_LAYOUT = {
  contentWidth: 329,
  /** Space between subtitle and Take Photos / Upload tabs. */
  headerToTabsGap: 40,
  modeTabs: {
    width: 329,
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
} as const;

export interface AddPhotoThumbnailSize {
  width: number;
  height: number;
}

/**
 * Thumbnails use h:w = 70:figmaWidth per slot at full size.
 * If the row (widths + gaps) exceeds the viewfinder width, scale down uniformly
 * so everything fits with equal heights.
 */
export function getAddPhotoThumbnailSizes(
  frameId: keyof typeof ADD_PHOTO_LAYOUT.thumbnail.widthsByFrame,
): AddPhotoThumbnailSize[] {
  const { thumbnail, viewfinder } = ADD_PHOTO_LAYOUT;
  const maxRowWidth = viewfinder.width;
  const baseWidths = [...thumbnail.widthsByFrame[frameId]];
  const baseHeight = thumbnail.height;
  const gap = thumbnail.gap;

  const thumbnailsWidth = baseWidths.reduce((sum, width) => sum + width, 0);
  const gapsWidth = Math.max(0, baseWidths.length - 1) * gap;
  const totalRowWidth = thumbnailsWidth + gapsWidth;

  if (totalRowWidth <= maxRowWidth) {
    return baseWidths.map((width) => ({ width, height: baseHeight }));
  }

  const availableWidth = maxRowWidth - gapsWidth;
  const scale = availableWidth / thumbnailsWidth;
  const height = baseHeight * scale;

  const scaled = baseWidths.map((width) => width * scale);
  const rounded = scaled.map((width) => Math.floor(width * 100) / 100);
  const widthTotal = rounded.reduce((sum, width) => sum + width, 0);
  const widthRemainder = Math.round((availableWidth - widthTotal) * 100) / 100;
  rounded[rounded.length - 1] += widthRemainder;

  return rounded.map((width) => ({ width, height }));
}
