"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { saveStrip } from "@/lib/generateStrip";
import { trackPhotobooth } from "@/lib/analytics";
import {
  theme,
  getPrintStripHeight,
  getPrintStripStartOffset,
  getPrintStripWidth,
  getPrinterTopInset,
} from "@/themes";
import { scaleBoxToFit } from "@/lib/responsiveLayout";
import { useAvailableContentWidth } from "@/hooks/useAvailableContentWidth";
import { useViewportLayout } from "@/hooks/useViewportLayout";
import { PageContent, PageShell, PinkButton } from "@/components/ui/PageShell";

export function PrintStep() {
  const { finalStripUrl, frame, reset, goBack } = usePhotobooth();
  const printLayout = theme.layout.print;
  const printCopy = theme.copy.print;
  const [isPrinting, setIsPrinting] = useState(true);
  const availableContentWidth = useAvailableContentWidth();
  const { contentWidth, contentHeight } = useViewportLayout({ hasFooter: false });
  const previewWidth = getPrintStripWidth(
    Math.min(printLayout.contentWidth, contentWidth, availableContentWidth),
  );
  const stripHeight = useMemo(
    () => getPrintStripHeight(previewWidth, frame.aspectRatio),
    [frame.aspectRatio, previewWidth],
  );
  const stripDimensions = useMemo(
    () =>
      scaleBoxToFit(
        previewWidth,
        stripHeight,
        previewWidth,
        Math.max(140, contentHeight * 0.52),
      ),
    [contentHeight, previewWidth, stripHeight],
  );
  const stripStartOffset = getPrintStripStartOffset(stripDimensions.height);

  useEffect(() => {
    if (!finalStripUrl) return;

    const timer = window.setTimeout(() => {
      setIsPrinting(false);
    }, printLayout.printingDurationMs);

    return () => window.clearTimeout(timer);
  }, [finalStripUrl, printLayout.printingDurationMs]);

  const handleDownload = () => {
    if (!finalStripUrl) return;
    trackPhotobooth("photobooth_strip_downloaded", { frameId: frame.id });
    void saveStrip(finalStripUrl);
  };

  return (
    <PageShell showBack onBack={goBack} mainClassName="min-h-0">
      <PageContent
        className="flex min-h-0 w-full flex-1 flex-col"
        style={{ marginTop: printLayout.headerToTitleGap }}
      >
        <h2
          className="shrink-0 text-center font-cursive font-normal text-black"
          style={{ fontSize: printLayout.titleSize }}
        >
          {isPrinting ? printCopy.printing : printCopy.ready}
        </h2>

        <div
          className="mx-auto flex min-h-0 w-full flex-1 flex-col items-center"
          style={{ marginTop: printLayout.titleToContentGap }}
        >
          <div
            className="relative shrink-0"
            style={{
              width: printLayout.printerWidth,
              minHeight:
                getPrinterTopInset() +
                printLayout.stripSlotTop +
                stripDimensions.height,
              paddingTop: getPrinterTopInset(),
            }}
          >
            <div className="relative isolate w-full">
              <div
                className="absolute left-0 w-full"
                style={{
                  top: printLayout.printerBottomOffset,
                  zIndex: printLayout.zIndex.printerBottom,
                }}
              >
                <Image
                  src={theme.assets.printerBottom}
                  alt=""
                  width={printLayout.printerWidth}
                  height={printLayout.printerBottomHeight}
                  className="block h-auto w-full"
                  priority
                />
              </div>

              {finalStripUrl ? (
                <div
                  className="absolute left-1/2 -translate-x-1/2 overflow-hidden"
                  style={{
                    top: printLayout.stripSlotTop,
                    width: stripDimensions.width,
                    height: stripDimensions.height,
                    zIndex: printLayout.zIndex.strip,
                  }}
                >
                  <motion.div
                    style={{ width: stripDimensions.width }}
                    initial={{ y: stripStartOffset }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: printLayout.printingDurationMs / 1000,
                      ease: "linear",
                    }}
                    onAnimationComplete={() => setIsPrinting(false)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={finalStripUrl}
                      alt={printCopy.stripAlt}
                      className="block max-w-full rounded-sm object-contain shadow-md"
                      style={{ width: stripDimensions.width }}
                    />
                  </motion.div>
                </div>
              ) : null}

              <div
                className="pointer-events-none absolute left-0 top-0 w-full"
                style={{ zIndex: printLayout.zIndex.printerTop }}
              >
                <Image
                  src={theme.assets.printerTop}
                  alt=""
                  width={printLayout.printerWidth}
                  height={printLayout.printerTopHeight}
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
                <Image src={theme.assets.home} alt="" width={16} height={16} />
                {printCopy.homeButton}
              </PinkButton>
              <PinkButton onClick={handleDownload}>
                <Image src={theme.assets.download} alt="" width={16} height={16} />
                {printCopy.downloadButton}
              </PinkButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </PageContent>
    </PageShell>
  );
}
