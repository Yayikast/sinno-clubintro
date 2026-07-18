"use client";

import { useEffect, useState } from "react";
import { PAGE_LAYOUT } from "@/lib/pageLayout";

/** Content column width after 32px horizontal page padding. */
export function getAvailableContentWidth(viewportWidth: number = PAGE_LAYOUT.frameWidth): number {
  const pageWidth = Math.min(PAGE_LAYOUT.frameWidth, viewportWidth);
  return Math.max(0, pageWidth - PAGE_LAYOUT.paddingX * 2);
}

export function useAvailableContentWidth(): number {
  const [width, setWidth] = useState<number>(PAGE_LAYOUT.contentWidth);

  useEffect(() => {
    const update = () => {
      setWidth(getAvailableContentWidth(document.documentElement.clientWidth));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}
