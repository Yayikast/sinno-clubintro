"use client";

import { useEffect, useState } from "react";
import { getAvailableContentWidth } from "@/hooks/useAvailableContentWidth";
import {
  getAvailableContentHeight,
  getResponsivePaddingY,
  VIEWPORT_CHROME,
} from "@/lib/responsiveLayout";
import { PAGE_LAYOUT } from "@/lib/pageLayout";

interface ViewportLayoutOptions {
  /** Reserve space for the page footer action area. */
  hasFooter?: boolean;
  designPaddingY?: number;
}

interface ViewportLayout {
  viewportWidth: number;
  viewportHeight: number;
  paddingY: number;
  contentWidth: number;
  contentHeight: number;
}

function getViewportHeight(): number {
  return window.visualViewport?.height ?? document.documentElement.clientHeight;
}

export function useViewportLayout(
  options: ViewportLayoutOptions = {},
): ViewportLayout {
  const { hasFooter = false, designPaddingY = PAGE_LAYOUT.paddingY } = options;

  const [layout, setLayout] = useState<ViewportLayout>(() => ({
    viewportWidth: PAGE_LAYOUT.frameWidth,
    viewportHeight: 852,
    paddingY: PAGE_LAYOUT.paddingY,
    contentWidth: PAGE_LAYOUT.contentWidth,
    contentHeight: 600,
  }));

  useEffect(() => {
    const update = () => {
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = getViewportHeight();
      const paddingY = getResponsivePaddingY(viewportHeight, designPaddingY);
      const contentWidth = getAvailableContentWidth(viewportWidth);
      const contentHeight = getAvailableContentHeight(viewportHeight, {
        paddingY,
        footerHeight: hasFooter ? VIEWPORT_CHROME.footerHeight : 0,
      });

      setLayout({
        viewportWidth,
        viewportHeight,
        paddingY,
        contentWidth,
        contentHeight,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, [designPaddingY, hasFooter]);

  return layout;
}
