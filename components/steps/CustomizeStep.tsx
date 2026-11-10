"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import {
  theme,
  estimateCustomizeControlsHeight,
  getCustomizeColumnWidths,
  getCustomizeControlsContentWidth,
  getCustomizePreviewMaxHeight,
} from "@/themes";
import { STRIP_CAPTION_MAX_LENGTH, STRIP_CUSTOMIZE_PRINT_CAPTION_EXTRA_OFFSET_PX } from "@/lib/stripCaption";
import { generateStrip, preloadFrameOverlay } from "@/lib/generateStrip";
import { preloadFillSwatches } from "@/lib/frameFill";
import { trackPhotobooth } from "@/lib/analytics";
import { scaleBoxToFit } from "@/lib/responsiveLayout";
import { useAvailableContentWidth } from "@/hooks/useAvailableContentWidth";
import { useStableContentHeight } from "@/hooks/useStableContentHeight";
import { useViewportLayout } from "@/hooks/useViewportLayout";
import { useIsLandscape } from "@/hooks/useIsLandscape";
import { LandscapeShell } from "@/components/ui/LandscapeShell";
import {
  ColorSwatchGrid,
  ActionFooter,
  PageContent,
  PageShell,
  PinkButton,
} from "@/components/ui/PageShell";

export function CustomizeStep() {
  const {
    frame,
    photos,
    frameColor,
    textColor,
    captionText,
    setFrameColor,
    setTextColor,
    setCaptionText,
    setFinalStripUrl,
    goToStep,
    goBack,
  } = usePhotobooth();

  const customizeLayout = theme.layout.customize;
  const customizeCopy = theme.copy.customize;
  const { frameColorSwatches, textColorSwatches } = theme.frames;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [printError, setPrintError] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const availableContentWidth = useAvailableContentWidth();
  const { contentHeight: liveContentHeight } = useViewportLayout({ hasFooter: true });
  const layoutContentHeight = useStableContentHeight(liveContentHeight);
  const contentWidth = Math.min(customizeLayout.contentWidth, availableContentWidth);
  const { previewWidth, controlsWidth } = getCustomizeColumnWidths(contentWidth);
  const { width: controlsContentWidth, swatchSize } = getCustomizeControlsContentWidth(
    frameColorSwatches.length,
    textColorSwatches.length,
    contentWidth,
  );
  const controlsHeight = estimateCustomizeControlsHeight(
    frameColorSwatches.length,
    textColorSwatches.length,
    controlsWidth,
    swatchSize,
  );
  const previewMaxHeight = getCustomizePreviewMaxHeight(layoutContentHeight, controlsHeight);
  const previewDimensions = scaleBoxToFit(
    previewWidth,
    previewWidth / frame.aspectRatio,
    previewWidth,
    previewMaxHeight,
  );
  const rowHeight = Math.max(previewDimensions.height, controlsHeight);
  const isLandscape = useIsLandscape();

  useEffect(() => {
    preloadFrameOverlay(frame.svgPath);
    preloadFillSwatches(
      [
        ...frameColorSwatches.map((swatch) => swatch.value),
        ...textColorSwatches.map((swatch) => swatch.value),
      ],
      frame.id,
    );
  }, [frame.id, frame.svgPath, frameColorSwatches, textColorSwatches]);

  useEffect(() => {
    const filledPhotos = photos.filter((photo): photo is string => photo !== null);
    if (filledPhotos.length !== frame.photoCount) return;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      generateStrip(
        filledPhotos,
        frame,
        frameColor,
        textColor,
        captionText,
        STRIP_CUSTOMIZE_PRINT_CAPTION_EXTRA_OFFSET_PX,
      )
        .then((url) => setPreviewUrl(url))
        .catch(() => setPreviewUrl(null));
    }, 150);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [captionText, frame, frameColor, photos, textColor]);

  const handlePrint = async () => {
    if (isPreparingPrint) return;
    setIsPreparingPrint(true);
    setPrintError(false);

    try {
      const filledPhotos = photos.filter((photo): photo is string => photo !== null);
      const url = await generateStrip(
        filledPhotos,
        frame,
        frameColor,
        textColor,
        captionText,
        STRIP_CUSTOMIZE_PRINT_CAPTION_EXTRA_OFFSET_PX,
      );
      setFinalStripUrl(url);
      trackPhotobooth("photobooth_strip_printed", { frameId: frame.id });
      goToStep("print");
    } catch {
      setPrintError(true);
      setIsPreparingPrint(false);
    }
  };

  const printFooter = (
    <ActionFooter
      hint={
        printError ? (
          <span style={{ color: "#B00020" }}>{customizeCopy.printFailed}</span>
        ) : undefined
      }
    >
      <PinkButton onClick={handlePrint} disabled={isPreparingPrint}>
        <Image src={theme.assets.print} alt="" width={16} height={16} />
        {customizeCopy.printButton}
      </PinkButton>
    </ActionFooter>
  );

  const renderPreview = (size: { width: number; height: number }) =>
    previewUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewUrl}
        alt={customizeCopy.previewAlt}
        className="block max-h-full max-w-full rounded-sm object-contain shadow-md"
        style={{ width: size.width, height: size.height }}
      />
    ) : (
      <div className="rounded-sm bg-black/5" style={{ width: size.width, height: size.height }} />
    );

  const renderControls = (width: number, swatch: number) => (
    <>
      <ColorSwatchGrid
        label={customizeCopy.frameLabel}
        colors={frameColorSwatches}
        selected={frameColor}
        onSelect={setFrameColor}
        swatchSize={swatch}
        swatchGap={customizeLayout.swatchGap}
      />

      <div className="flex flex-col" style={{ gap: customizeLayout.labelToSwatchesGap }}>
        <p className="shrink-0 font-mono text-xs text-black">{customizeCopy.textLabel}</p>
        <ColorSwatchGrid
          label={customizeCopy.textLabel}
          showLabel={false}
          colors={textColorSwatches}
          selected={textColor}
          onSelect={setTextColor}
          swatchSize={swatch}
          swatchGap={customizeLayout.swatchGap}
        />
        <input
          type="text"
          value={captionText}
          onChange={(event) => setCaptionText(event.target.value)}
          maxLength={STRIP_CAPTION_MAX_LENGTH}
          className="font-cursive shrink-0 bg-transparent text-black outline-none"
          style={{
            width,
            maxWidth: "100%",
            boxSizing: "border-box",
            borderRadius: customizeLayout.inputRadius,
            border: `1px solid ${customizeLayout.inputBorder}`,
            paddingInline: customizeLayout.inputPaddingX,
            paddingBlock: customizeLayout.inputPaddingY,
            fontSize: customizeLayout.inputFontSize,
            minHeight: customizeLayout.inputMinHeight,
            height: customizeLayout.inputMinHeight,
            lineHeight: 1,
          }}
        />
      </div>
    </>
  );

  if (isLandscape) {
    return (
      <LandscapeShell
        showBack
        onBack={goBack}
        media={(size) =>
          renderPreview(
            scaleBoxToFit(size.height * frame.aspectRatio, size.height, size.width, size.height),
          )
        }
        controls={(width) => (
          <div
            className="flex flex-1 flex-col justify-center"
            style={{ gap: customizeLayout.sectionGap }}
          >
            {renderControls(width, customizeLayout.swatchMinSize)}
          </div>
        )}
        footer={printFooter}
      />
    );
  }

  return (
    <PageShell
      showBack
      onBack={goBack}
      mainClassName="min-h-0"
      footerStyle={{ marginTop: customizeLayout.contentToFooterGap }}
      footer={printFooter}
    >
      <PageContent className="flex w-full flex-1 flex-col justify-center overflow-visible">
        <div
          className="customize-layout-row mx-auto flex w-fit max-w-full shrink-0 items-stretch"
          style={{
            gap: customizeLayout.columnGap,
            maxWidth: contentWidth,
          }}
        >
          <div
            className="flex shrink-0 items-center justify-center"
            style={{
              width: previewDimensions.width,
              height: rowHeight,
            }}
          >
            {renderPreview(previewDimensions)}
          </div>

          <div
            className="flex shrink-0 flex-col justify-center"
            style={{
              gap: customizeLayout.sectionGap,
              width: controlsContentWidth,
              height: rowHeight,
            }}
          >
            {renderControls(controlsContentWidth, swatchSize)}
          </div>
        </div>
      </PageContent>
    </PageShell>
  );
}
