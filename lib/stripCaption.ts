/** Caption font size as a share of strip / preview width (canvas + UI previews). */
export const STRIP_CAPTION_FONT_SIZE_RATIO = 0.1;

/** Max caption text width as a share of strip width (keeps side margins). */
export const STRIP_CAPTION_MAX_WIDTH_RATIO = 0.86;

/** Hard character limit for caption input and rendering. */
export const STRIP_CAPTION_MAX_LENGTH = 20;

/** Downward nudge for caption text (px at export scale). */
export const STRIP_CAPTION_Y_OFFSET_PX = 2;

export const STRIP_CAPTION_FONT_FAMILY = "Caveat, cursive";

export function getStripCaptionPositionY(
  captionY: number,
  stripHeight: number,
  yOffsetPx: number = STRIP_CAPTION_Y_OFFSET_PX,
): number {
  return captionY * stripHeight + yOffsetPx;
}

export function clampStripCaption(text: string): string {
  return text.slice(0, STRIP_CAPTION_MAX_LENGTH);
}

export function getStripCaptionFontSize(stripWidth: number, scale = 1): number {
  return Math.max(1, Math.round(stripWidth * STRIP_CAPTION_FONT_SIZE_RATIO * scale));
}

export function measureStripCaptionWidth(
  text: string,
  fontSize: number,
  fontFamily: string = STRIP_CAPTION_FONT_FAMILY,
): number {
  const trimmed = clampStripCaption(text).trim();
  if (!trimmed) return 0;

  if (typeof document === "undefined") {
    return trimmed.length * fontSize * 0.45;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return trimmed.length * fontSize * 0.45;
  }

  ctx.font = `${fontSize}px ${fontFamily}`;
  return ctx.measureText(trimmed).width;
}

/** Base caption size, shrinking for long text so it stays on one line within the strip. */
export function getFittedStripCaptionFontSize(
  stripWidth: number,
  captionText: string,
  fontSizeScale = 1,
  measureAtSize: (fontSize: number) => number = (fontSize) =>
    measureStripCaptionWidth(captionText, fontSize),
): number {
  const trimmed = clampStripCaption(captionText).trim();
  if (!trimmed) {
    return getStripCaptionFontSize(stripWidth, fontSizeScale);
  }

  const maxTextWidth = stripWidth * STRIP_CAPTION_MAX_WIDTH_RATIO;
  let fontSize = getStripCaptionFontSize(stripWidth, fontSizeScale);

  while (fontSize > 1 && measureAtSize(fontSize) > maxTextWidth) {
    fontSize -= 1;
  }

  return fontSize;
}
