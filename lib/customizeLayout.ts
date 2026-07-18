import { LANDING_LAYOUT } from "@/lib/landingLayout";
import { PAGE_LAYOUT } from "@/lib/pageLayout";

/** Customize page layout tokens from Figma (393×852 frame). */
export const CUSTOMIZE_LAYOUT = {
  contentWidth: PAGE_LAYOUT.contentWidth,
  /** Space between subtitle ("- capture the moments -") and page title. */
  headerToTitleGap: 40,
  titleSize: 24,
  /** Space between "Customize your frame <3" and preview / swatch controls. */
  titleToContentGap: 32,
  previewWidth: LANDING_LAYOUT.previewWidth,
  previewHeight: LANDING_LAYOUT.previewHeight,
  columnGap: 16,
  sectionGap: 16,
  labelToSwatchesGap: 8,
  swatchSize: 32,
  swatchGap: 8,
  swatchColumns: 4,
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
  inputPaddingX: 12,
  inputPaddingY: 8,
  inputFontSize: 14,
} as const;

export function getCustomizePreviewSize(aspectRatio: number): {
  width: number;
  height: number;
} {
  const maxWidth = Math.min(
    CUSTOMIZE_LAYOUT.previewWidth,
    CUSTOMIZE_LAYOUT.contentWidth -
      CUSTOMIZE_LAYOUT.swatchColumns * CUSTOMIZE_LAYOUT.swatchSize -
      (CUSTOMIZE_LAYOUT.swatchColumns - 1) * CUSTOMIZE_LAYOUT.swatchGap -
      CUSTOMIZE_LAYOUT.columnGap,
  );
  const height =
    aspectRatio <= CUSTOMIZE_LAYOUT.previewWidth / CUSTOMIZE_LAYOUT.previewHeight
      ? CUSTOMIZE_LAYOUT.previewHeight * (maxWidth / CUSTOMIZE_LAYOUT.previewWidth)
      : maxWidth / aspectRatio;

  return { width: maxWidth, height };
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
