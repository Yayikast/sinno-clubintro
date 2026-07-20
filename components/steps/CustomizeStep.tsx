"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import {
  theme,
  estimateCustomizeControlsHeight,
  getCustomizeAvailableRowHeight,
  getCustomizeColumnWidths,
  getCustomizeControlsContentWidth,
  getCustomizePreviewMaxHeight,
} from "@/themes";
import { STRIP_CAPTION_MAX_LENGTH, STRIP_CUSTOMIZE_PRINT_CAPTION_EXTRA_OFFSET_PX } from "@/lib/stripCaption";
import { generateStrip } from "@/lib/generateStrip";
import { scaleBoxToFit } from "@/lib/responsiveLayout";
import { useAvailableContentWidth } from "@/hooks/useAvailableContentWidth";
import { useStableContentHeight } from "@/hooks/useStableContentHeight";
import { useViewportLayout } from "@/hooks/useViewportLayout";
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
  const availableRowHeight = getCustomizeAvailableRowHeight(layoutContentHeight);
  const previewDimensions = scaleBoxToFit(
    previewWidth,
    previewWidth / frame.aspectRatio,
    previewWidth,
    previewMaxHeight,
  );
  const rowHeight = Math.max(previewDimensions.height, controlsHeight);
  const liveAvailableRowHeight = getCustomizeAvailableRowHeight(liveContentHeight);
  const mainScroll =
    rowHeight > availableRowHeight + 0.5 || rowHeight > liveAvailableRowHeight + 0.5;

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
    goToStep("print");
  };

  return (
    <PageShell
      showBack
      onBack={goBack}
      mainClassName="min-h-0"
      mainScroll={mainScroll}
      footerStyle={{ marginTop: customizeLayout.contentToFooterGap }}
      footer={
        <ActionFooter>
          <PinkButton onClick={handlePrint}>
            <Image src={theme.assets.print} alt="" width={16} height={16} />
            {customizeCopy.printButton}
          </PinkButton>
        </ActionFooter>
      }
    >
      <PageContent
        className="flex w-full shrink-0 flex-col overflow-visible"
        style={{
          marginTop: customizeLayout.headerToTitleGap,
          gap: customizeLayout.titleToContentGap,
        }}
      >
        <h2
          className="shrink-0 font-cursive text-center font-normal text-black"
          style={{ fontSize: customizeLayout.titleSize }}
        >
          {customizeCopy.title}
        </h2>

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
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={customizeCopy.previewAlt}
                className="block max-h-full max-w-full rounded-sm object-contain shadow-md"
                style={{
                  width: previewDimensions.width,
                  height: previewDimensions.height,
                }}
              />
            ) : (
              <div
                className="rounded-sm bg-black/5"
                style={{
                  width: previewDimensions.width,
                  height: previewDimensions.height,
                }}
              />
            )}
          </div>

          <div
            className="flex shrink-0 flex-col justify-center"
            style={{
              gap: customizeLayout.sectionGap,
              width: controlsContentWidth,
              height: rowHeight,
            }}
          >
            <ColorSwatchGrid
              label={customizeCopy.frameLabel}
              colors={frameColorSwatches}
              selected={frameColor}
              onSelect={setFrameColor}
              swatchSize={swatchSize}
              swatchGap={customizeLayout.swatchGap}
            />

            <div
              className="flex flex-col"
              style={{ gap: customizeLayout.labelToSwatchesGap }}
            >
              <p className="shrink-0 font-mono text-xs text-black">{customizeCopy.textLabel}</p>
              <ColorSwatchGrid
                label={customizeCopy.textLabel}
                showLabel={false}
                colors={textColorSwatches}
                selected={textColor}
                onSelect={setTextColor}
                swatchSize={swatchSize}
                swatchGap={customizeLayout.swatchGap}
              />
              <input
                type="text"
                value={captionText}
                onChange={(event) => setCaptionText(event.target.value)}
                maxLength={STRIP_CAPTION_MAX_LENGTH}
                className="font-cursive shrink-0 bg-transparent text-black outline-none"
                style={{
                  width: controlsContentWidth,
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
          </div>
        </div>
      </PageContent>
    </PageShell>
  );
}
