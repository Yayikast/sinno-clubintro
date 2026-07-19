import { PAGE_LAYOUT } from "@/lib/pageLayout";

/** Fixed chrome heights used to estimate usable content area. */
export const VIEWPORT_CHROME = {
  headerHeight: 52,
  footerHeight: 83,
} as const;

/** Scale vertical page padding down on short viewports. */
export function getResponsivePaddingY(
  viewportHeight: number,
  designPadding: number = PAGE_LAYOUT.paddingY,
): number {
  return Math.round(Math.min(designPadding, Math.max(16, viewportHeight * 0.065)));
}

/** Usable main-column height after page padding and chrome. */
export function getAvailableContentHeight(
  viewportHeight: number,
  options: {
    paddingY?: number;
    headerHeight?: number;
    footerHeight?: number;
  } = {},
): number {
  const paddingY = options.paddingY ?? getResponsivePaddingY(viewportHeight);
  const headerHeight = options.headerHeight ?? VIEWPORT_CHROME.headerHeight;
  const footerHeight = options.footerHeight ?? 0;

  return Math.max(
    0,
    viewportHeight - paddingY * 2 - headerHeight - footerHeight,
  );
}

/** Fit a box inside max bounds without upscaling. */
export function scaleBoxToFit(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= 0 || height <= 0 || maxWidth <= 0 || maxHeight <= 0) {
    return { width: 0, height: 0 };
  }

  const scale = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.round(width * scale * 100) / 100,
    height: Math.round(height * scale * 100) / 100,
  };
}
