"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import {
  createShareFile,
  createStripFile,
  shareOrDownloadFile,
} from "@/lib/generateStrip";
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
import { useIsLandscape } from "@/hooks/useIsLandscape";
import { PageContent, PageShell, PinkButton } from "@/components/ui/PageShell";
import { LandscapeShell } from "@/components/ui/LandscapeShell";

export function PrintStep() {
  const { finalStripUrl, frame, reset, goBack } = usePhotobooth();
  const printLayout = theme.layout.print;
  const printCopy = theme.copy.print;
  const [isPrinting, setIsPrinting] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [preparedFiles, setPreparedFiles] = useState<{ save: File; share: File } | null>(null);
  // Ignores repeat taps while a share sheet/download is in progress — a second
  // share() call while one is open throws and would fall back to a download.
  const [busyAction, setBusyAction] = useState<"save" | "share" | null>(null);
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
  const isLandscape = useIsLandscape();

  useEffect(() => {
    if (!finalStripUrl) return;

    const timer = window.setTimeout(() => {
      setIsPrinting(false);
    }, printLayout.printingDurationMs);

    return () => window.clearTimeout(timer);
  }, [finalStripUrl, printLayout.printingDurationMs]);

  // Build the Save and Share files once the strip has finished printing (not
  // during, to keep the animation smooth), so a tap can open the share sheet
  // right away — browsers only allow that shortly after the tap.
  useEffect(() => {
    if (!finalStripUrl || isPrinting) return;

    let cancelled = false;
    Promise.all([createStripFile(finalStripUrl), createShareFile(finalStripUrl, frame)])
      .then(([save, share]) => {
        if (!cancelled) setPreparedFiles({ save, share });
      })
      .catch(() => {
        // Fine — the buttons build the file when tapped instead.
      });

    return () => {
      cancelled = true;
    };
  }, [finalStripUrl, frame, isPrinting]);

  const runFileAction = (
    action: "save" | "share",
    prepared: File | undefined,
    buildFile: () => Promise<File>,
    onError: () => void,
  ) => {
    setBusyAction(action);
    const done = prepared
      ? shareOrDownloadFile(prepared)
      : buildFile().then(shareOrDownloadFile);
    done.catch(onError).finally(() => setBusyAction(null));
  };

  const handleDownload = () => {
    if (!finalStripUrl || busyAction) return;
    trackPhotobooth("photobooth_strip_downloaded", { frameId: frame.id });
    setSaveError(false);
    runFileAction(
      "save",
      preparedFiles?.save,
      () => createStripFile(finalStripUrl),
      () => setSaveError(true),
    );
  };

  const handleShare = () => {
    if (!finalStripUrl || busyAction) return;
    trackPhotobooth("photobooth_strip_shared", { frameId: frame.id });
    setShareError(false);
    runFileAction(
      "share",
      preparedFiles?.share,
      () => createShareFile(finalStripUrl, frame),
      () => setShareError(true),
    );
  };

  const title = (
    <h2
      className="shrink-0 text-center font-cursive font-normal text-black"
      style={{ fontSize: printLayout.titleSize }}
    >
      {isPrinting ? printCopy.printing : printCopy.ready}
    </h2>
  );

  const actions = (
    <AnimatePresence>
      {!isPrinting ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex shrink-0 flex-col items-center gap-3"
        >
          {shareError ? (
            <p className="font-mono text-center text-xs" style={{ color: "#B00020" }}>
              {printCopy.shareFailed}
            </p>
          ) : null}
          {saveError ? (
            <p className="font-mono text-center text-xs" style={{ color: "#B00020" }}>
              {printCopy.saveFailed}
            </p>
          ) : null}
          <PinkButton onClick={handleShare} disabled={busyAction !== null}>
            <Image src={theme.assets.share} alt="" width={16} height={16} />
            {printCopy.shareButton}
          </PinkButton>
          <div className="flex justify-center gap-3">
            <PinkButton variant="secondary" onClick={reset}>
              <Image src={theme.assets.home} alt="" width={16} height={16} />
              {printCopy.homeButton}
            </PinkButton>
            <PinkButton onClick={handleDownload} disabled={busyAction !== null}>
              <Image src={theme.assets.download} alt="" width={16} height={16} />
              {printCopy.downloadButton}
            </PinkButton>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const renderPrinter = (strip: { width: number; height: number }) => (
          <div
            className="relative shrink-0"
            style={{
              width: printLayout.printerWidth,
              minHeight: getPrinterTopInset() + printLayout.stripSlotTop + strip.height,
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
                  preload
                />
              </div>

              {finalStripUrl ? (
                <div
                  className="absolute left-1/2 -translate-x-1/2 overflow-hidden"
                  style={{
                    top: printLayout.stripSlotTop,
                    width: strip.width,
                    height: strip.height,
                    zIndex: printLayout.zIndex.strip,
                  }}
                >
                  <motion.div
                    style={{ width: strip.width }}
                    initial={{ y: getPrintStripStartOffset(strip.height) }}
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
                      style={{ width: strip.width }}
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
                  preload
                />
              </div>
            </div>
          </div>
  );

  if (isLandscape) {
    return (
      <LandscapeShell
        showBack
        onBack={goBack}
        media={(size) =>
          renderPrinter(
            scaleBoxToFit(
              previewWidth,
              stripHeight,
              printLayout.printerWidth,
              Math.max(0, size.height - getPrinterTopInset() - printLayout.stripSlotTop),
            ),
          )
        }
        controls={() => <div className="flex flex-1 flex-col justify-center">{title}</div>}
        footer={actions}
      />
    );
  }

  return (
    <PageShell showBack onBack={goBack} mainClassName="min-h-0">
      <PageContent
        className="flex min-h-0 w-full flex-1 flex-col"
        style={{ marginTop: printLayout.headerToTitleGap }}
      >
        {title}

        <div
          className="mx-auto flex min-h-0 w-full flex-1 flex-col items-center"
          style={{ marginTop: printLayout.titleToContentGap }}
        >
          {renderPrinter(stripDimensions)}
        </div>

        <div className="mt-auto pt-6">{actions}</div>
      </PageContent>
    </PageShell>
  );
}
