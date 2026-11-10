"use client";

import { useSyncExternalStore } from "react";

/**
 * Screens shorter than this in landscape (phones turned sideways) get the
 * side-by-side layout. Taller landscape screens — tablets, desktop windows —
 * have room for the regular portrait column, so they keep it.
 */
const LANDSCAPE_MAX_HEIGHT = 600;

function subscribe(onChange: () => void): () => void {
  window.addEventListener("resize", onChange);
  window.addEventListener("orientationchange", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    window.removeEventListener("orientationchange", onChange);
  };
}

function getSnapshot(): boolean {
  return window.innerWidth > window.innerHeight && window.innerHeight <= LANDSCAPE_MAX_HEIGHT;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsLandscape(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
