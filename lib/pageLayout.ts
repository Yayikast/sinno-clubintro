/** Shared page frame — 393×852 Figma artboard. Margins: 32px horizontal, 56px vertical. */
export const PAGE_LAYOUT = {
  frameWidth: 393,
  paddingX: 32,
  paddingY: 56,
  /** Usable content width inside horizontal padding (393 − 32×2). */
  contentWidth: 329,
  /** Primary pill — Select / Next (133.33 × 35, 6px radius, 14px text). */
  primaryButton: {
    textSize: 14,
    width: 133.33,
    height: 35,
    radius: 6,
  },
  /** Hint text above footer action buttons (e.g. status line → Next). */
  actionFooter: {
    hintToButtonGap: 24,
  },
} as const;
