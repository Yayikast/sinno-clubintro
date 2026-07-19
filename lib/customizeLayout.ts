import { PAGE_LAYOUT } from "@/lib/pageLayout";

/** Customize page layout tokens from Figma (393×852 frame). */
export const CUSTOMIZE_LAYOUT = {
  contentWidth: PAGE_LAYOUT.contentWidth,
  /** Space between subtitle ("- capture the moments -") and page title. */
  headerToTitleGap: 40,
  titleSize: 24,
  /** Space between "Customize your frame <3" and preview / swatch controls. */
  titleToContentGap: 32,
  columnGap: 16,
  /** Left preview column as a share of content width (photostrip). */
  previewColumnShare: 0.42,
  sectionGap: 16,
  labelToSwatchesGap: 8,
  swatchMinSize: 30,
  swatchGap: 8,
  selectedRing: "#FFA8BD",
  swatchStroke: {
    innerColor: "rgba(0, 0, 0, 0.2)",
    innerWidth: 0.5,
    selectedOuterColor: "#FFA8BD",
    selectedOverlayColor: "rgba(0, 0, 0, 0.1)",
    selectedOuterWidth: 2,
  },
  inputRadius: 12,
  inputBorder: "rgba(0, 0, 0, 0.3)",
  inputPaddingX: 8,
  inputPaddingY: 4,
  inputFontSize: 14,
} as const;

/** Left preview + right controls widths inside the 329px content column. */
export function getCustomizeColumnWidths(contentWidth: number = CUSTOMIZE_LAYOUT.contentWidth): {
  previewWidth: number;
  controlsWidth: number;
} {
  const previewWidth = Math.round(contentWidth * CUSTOMIZE_LAYOUT.previewColumnShare);
  const controlsWidth = contentWidth - previewWidth - CUSTOMIZE_LAYOUT.columnGap;
  return { previewWidth, controlsWidth: Math.max(0, controlsWidth) };
}

/** Swatch diameter — never below `swatchMinSize` (30px). */
export function getCustomizeSwatchSize(
  contentWidth: number = CUSTOMIZE_LAYOUT.contentWidth,
): number {
  const { swatchMinSize, swatchGap } = CUSTOMIZE_LAYOUT;
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

/** Pixel width of a wrapped swatch row in the controls column. */
export function getSwatchGridWidth(
  swatchCount: number,
  containerWidth: number,
  swatchSize: number,
): number {
  const gap = CUSTOMIZE_LAYOUT.swatchGap;
  const perRow = Math.max(
    1,
    Math.floor((containerWidth + gap) / (swatchSize + gap)),
  );
  const columns = Math.min(swatchCount, perRow);
  return columns * swatchSize + Math.max(0, columns - 1) * gap;
}

/** Controls column width — hugs the widest swatch grid / text field. */
export function getCustomizeControlsContentWidth(
  frameSwatchCount: number,
  textSwatchCount: number,
  contentWidth: number = CUSTOMIZE_LAYOUT.contentWidth,
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
  const gap = CUSTOMIZE_LAYOUT.swatchGap;
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
  const gap = CUSTOMIZE_LAYOUT.swatchGap;
  const rows = getSwatchRowCount(count, contentWidth, swatchSize);
  return rows * swatchSize + Math.max(0, rows - 1) * gap;
}

/** Approximate fixed height of swatch controls below the preview. */
export function estimateCustomizeControlsHeight(
  frameSwatchCount: number,
  textSwatchCount: number,
  contentWidth: number,
  swatchSize = getCustomizeSwatchSize(contentWidth),
): number {
  const layout = CUSTOMIZE_LAYOUT;
  const labelHeight = 12;
  const inputHeight = layout.inputPaddingY * 2 + layout.inputFontSize + 2;

  return (
    labelHeight +
    layout.labelToSwatchesGap +
    getSwatchGridHeight(frameSwatchCount, contentWidth, swatchSize) +
    layout.sectionGap +
    labelHeight +
    layout.labelToSwatchesGap +
    getSwatchGridHeight(textSwatchCount, contentWidth, swatchSize) +
    layout.labelToSwatchesGap +
    inputHeight
  );
}

/** Max preview height for side-by-side layout (strip left, controls right). */
export function getCustomizePreviewMaxHeight(
  viewportHeight: number,
  frameSwatchCount: number,
  textSwatchCount: number,
  contentWidth: number,
  swatchSize?: number,
): number {
  const { controlsWidth } = getCustomizeColumnWidths(contentWidth);
  const size = swatchSize ?? getCustomizeSwatchSize(controlsWidth);
  const controlsHeight = estimateCustomizeControlsHeight(
    frameSwatchCount,
    textSwatchCount,
    controlsWidth,
    size,
  );

  const reserved =
    PAGE_LAYOUT.paddingY * 2 +
    52 +
    CUSTOMIZE_LAYOUT.headerToTitleGap +
    CUSTOMIZE_LAYOUT.titleSize * 1.2 +
    CUSTOMIZE_LAYOUT.titleToContentGap +
    PAGE_LAYOUT.primaryButton.height +
    16;

  const rowMaxHeight = Math.max(72, viewportHeight - reserved);
  return Math.min(rowMaxHeight, controlsHeight);
}

/** Swatch ring — inner stroke always; pink outer + black overlay when selected. */
export function getSwatchBoxShadow(selected: boolean): string {
  const { swatchStroke } = CUSTOMIZE_LAYOUT;
  const inner = `inset 0 0 0 ${swatchStroke.innerWidth}px ${swatchStroke.innerColor}`;

  if (!selected) {
    return inner;
  }

  const outer = `0 0 0 ${swatchStroke.selectedOuterWidth}px ${swatchStroke.selectedOuterColor}`;
  const overlay = `0 0 0 ${swatchStroke.selectedOuterWidth}px ${swatchStroke.selectedOverlayColor}`;
  return `${inner}, ${outer}, ${overlay}`;
}
