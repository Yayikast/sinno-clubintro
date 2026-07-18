/** Landing page layout tokens from Figma (393×852 frame). */
export const LANDING_LAYOUT = {
  frameWidth: 393,
  frameHeight: 852,
  paddingX: 32,
  paddingY: 56,
  titleSize: 40,
  subtitleSize: 12,
  captionSize: 8,
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
  buttonWidth: 133.33,
  buttonHeight: 35,
  buttonRadius: 6,
} as const;

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
