"use client";

import { useEffect } from "react";
import { theme } from "@/themes";

/**
 * Catches any error not already handled by a specific flow (camera, upload,
 * save) so the user always sees a plain-language message instead of a blank
 * page or a raw technical stack trace.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const errorCopy = theme.copy.error;
  const buttonColors = theme.colors.button;

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-[var(--background)] px-8 text-center">
      <p className="font-cursive text-2xl font-normal text-black">{errorCopy.title}</p>
      <p className="font-mono text-xs text-black/70">{errorCopy.message}</p>
      <button
        type="button"
        onClick={reset}
        className="font-cursive rounded-md px-6 py-2 text-black"
        style={{ backgroundColor: buttonColors.primary }}
      >
        {errorCopy.retryButton}
      </button>
    </div>
  );
}
