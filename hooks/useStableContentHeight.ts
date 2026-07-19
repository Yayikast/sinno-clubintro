"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Keeps the largest content height seen for the current viewport width.
 * Mobile keyboards shrink visualViewport; use this to lock layout-sized UI.
 */
export function useStableContentHeight(contentHeight: number): number {
  const widthRef = useRef<number | null>(null);
  const [stableHeight, setStableHeight] = useState(contentHeight);

  useEffect(() => {
    const width = document.documentElement.clientWidth;

    setStableHeight((previous) => {
      if (widthRef.current !== width) {
        widthRef.current = width;
        return contentHeight;
      }

      return Math.max(previous, contentHeight);
    });
  }, [contentHeight]);

  return stableHeight;
}
