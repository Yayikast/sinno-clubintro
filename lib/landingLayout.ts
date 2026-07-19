import { PAGE_LAYOUT } from "@/lib/pageLayout";

/** Landing page layout tokens from Figma (393×852 frame). */
export const LANDING_LAYOUT = {
  frameWidth: PAGE_LAYOUT.frameWidth,
  frameHeight: 852,
  paddingX: PAGE_LAYOUT.paddingX,
  paddingY: PAGE_LAYOUT.paddingY,
  titleSize: 40,
  subtitleSize: 12,
  buttonTextSize: 14,
  headerToPreviewGap: 24,
  previewToSelectorGap: 20,
  selectorToButtonGap: 32,
  /** Main frame preview (vertical layouts). */
  previewWidth: 133.33,
  previewHeight: 400,
  /** Frame selector row — icons 50px tall. */
  selectorHeight: 50,
  /** Selected state background behind icon. */
  selectorSelectedSize: 66,
  selectorSelectedBg: "rgba(255, 255, 255, 0.2)",
  selectorSelectedRadius: 4,
  selectorGap: 8,
  buttonWidth: PAGE_LAYOUT.primaryButton.width,
  buttonHeight: PAGE_LAYOUT.primaryButton.height,
  buttonRadius: PAGE_LAYOUT.primaryButton.radius,
} as const;

/** Scale frame selector row to fit the content column without clipping. */
export function getFrameSelectorLayout(
  frameCount: number,
  availableWidth: number = PAGE_LAYOUT.contentWidth,
): {
  size: number;
  gap: number;
  iconHeight: number;
  radius: number;
} {
  const { selectorSelectedSize, selectorGap, selectorHeight, selectorSelectedRadius } =
    LANDING_LAYOUT;
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
  const height = LANDING_LAYOUT.previewHeight;
  const width =
    aspectRatio <= 400 / 1200
      ? LANDING_LAYOUT.previewWidth
      : height * aspectRatio;

  return { width, height };
}
