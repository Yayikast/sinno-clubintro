"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { downloadStrip } from "@/lib/generateStrip";
import {
  getPrintStripHeight,
  getPrintStripStartOffset,
  getPrintStripWidth,
  getPrinterTopInset,
  PRINT_LAYOUT,
} from "@/lib/printLayout";
import { useAvailableContentWidth } from "@/hooks/useAvailableContentWidth";
import { PageContent, PageShell, PinkButton } from "@/components/ui/PageShell";

export function PrintStep() {
  const { finalStripUrl, frame, reset, goBack } = usePhotobooth();
  const [isPrinting, setIsPrinting] = useState(true);
  const availableContentWidth = useAvailableContentWidth();
  const contentWidth = Math.min(PRINT_LAYOUT.contentWidth, availableContentWidth);
  const previewWidth = getPrintStripWidth(contentWidth);
  const stripHeight = useMemo(
    () => getPrintStripHeight(previewWidth, frame.aspectRatio),
    [frame.aspectRatio, previewWidth],
  );
  const stripStartOffset = getPrintStripStartOffset(stripHeight);

  useEffect(() => {
    if (!finalStripUrl) return;

    const timer = window.setTimeout(() => {
      setIsPrinting(false);
    }, PRINT_LAYOUT.printingDurationMs);

    return () => window.clearTimeout(timer);
  }, [finalStripUrl]);

  const handleDownload = () => {
    if (!finalStripUrl) return;
    downloadStrip(finalStripUrl);
  };

  return (
    <PageShell showBack onBack={goBack} mainClassName="min-h-0 overflow-visible">
      <PageContent
        className="flex h-full min-h-0 w-full flex-1 flex-col !overflow-visible"
        style={{ marginTop: PRINT_LAYOUT.headerToTitleGap }}
      >
        <h2
          className="shrink-0 text-center font-cursive font-normal text-black"
          style={{ fontSize: PRINT_LAYOUT.titleSize }}
        >
          {isPrinting ? "Printing..." : "Your photostrip is ready !"}
        </h2>

        <div
          className="mx-auto flex min-h-0 w-full flex-1 flex-col items-center overflow-visible"
          style={{ marginTop: PRINT_LAYOUT.titleToContentGap }}
        >
          <div
            className="relative shrink-0 overflow-visible"
            style={{
              width: PRINT_LAYOUT.printerWidth,
              minHeight:
                getPrinterTopInset() + PRINT_LAYOUT.stripSlotTop + stripHeight,
              paddingTop: getPrinterTopInset(),
            }}
          >
            <div className="relative isolate w-full">
              <div
                className="absolute left-0 w-full"
                style={{
                  top: PRINT_LAYOUT.printerBottomOffset,
                  zIndex: PRINT_LAYOUT.zIndex.printerBottom,
                }}
              >
                <Image
                  src="/figma/assets/printer-bottom.svg"
                  alt=""
                  width={PRINT_LAYOUT.printerWidth}
                  height={PRINT_LAYOUT.printerBottomHeight}
                  className="block h-auto w-full"
                  priority
                />
              </div>

              {finalStripUrl ? (
                <div
                  className="absolute left-1/2 -translate-x-1/2 overflow-hidden"
                  style={{
                    top: PRINT_LAYOUT.stripSlotTop,
                    width: previewWidth,
                    height: stripHeight,
                    zIndex: PRINT_LAYOUT.zIndex.strip,
                  }}
                >
                  <motion.div
                    style={{ width: previewWidth }}
                    initial={{ y: stripStartOffset }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: PRINT_LAYOUT.printingDurationMs / 1000,
                      ease: "linear",
                    }}
                    onAnimationComplete={() => setIsPrinting(false)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={finalStripUrl}
                      alt="Your photostrip"
                      className="block max-w-full rounded-sm object-contain shadow-md"
                      style={{ width: previewWidth }}
                    />
                  </motion.div>
                </div>
              ) : null}

              <div
                className="pointer-events-none absolute left-0 top-0 w-full"
                style={{ zIndex: PRINT_LAYOUT.zIndex.printerTop }}
              >
                <Image
                  src="/figma/assets/printer-top.svg"
                  alt=""
                  width={PRINT_LAYOUT.printerWidth}
                  height={PRINT_LAYOUT.printerTopHeight}
                  className="block h-auto w-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {!isPrinting ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-auto flex shrink-0 justify-center gap-3 pt-6"
            >
              <PinkButton variant="secondary" onClick={reset}>
                <Image src="/figma/icons/home.svg" alt="" width={16} height={16} />
                Home
              </PinkButton>
              <PinkButton onClick={handleDownload}>
                <Image src="/figma/icons/download.svg" alt="" width={16} height={16} />
                Download
              </PinkButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </PageContent>
    </PageShell>
  );
}
