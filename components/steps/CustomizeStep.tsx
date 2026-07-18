"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { FRAME_COLOR_SWATCHES, TEXT_COLOR_SWATCHES } from "@/lib/frames";
import { CUSTOMIZE_LAYOUT, getCustomizePreviewSize } from "@/lib/customizeLayout";
import { generateStrip } from "@/lib/generateStrip";
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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const previewSize = getCustomizePreviewSize(frame.aspectRatio);

  useEffect(() => {
    const filledPhotos = photos.filter((photo): photo is string => photo !== null);
    if (filledPhotos.length !== frame.photoCount) return;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      generateStrip(filledPhotos, frame, frameColor, textColor, captionText)
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
    );
    setFinalStripUrl(url);
    goToStep("print");
  };

  return (
    <PageShell
      showBack
      onBack={goBack}
      footer={
        <ActionFooter>
          <PinkButton onClick={handlePrint}>
            <Image src="/figma/icons/print.svg" alt="" width={16} height={16} />
            Print
          </PinkButton>
        </ActionFooter>
      }
    >
      <PageContent
        className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
        style={{ marginTop: CUSTOMIZE_LAYOUT.headerToTitleGap }}
      >
        <h2
          className="shrink-0 font-cursive text-center font-normal text-black"
          style={{ fontSize: CUSTOMIZE_LAYOUT.titleSize }}
        >
          Customize your frame &lt;3
        </h2>

        <div
          className="flex w-full min-w-0 items-start"
          style={{
            marginTop: CUSTOMIZE_LAYOUT.titleToContentGap,
            gap: CUSTOMIZE_LAYOUT.columnGap,
          }}
        >
          <div className="shrink-0" style={{ width: previewSize.width }}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Strip preview"
                className="rounded-sm shadow-md"
                style={{
                  width: previewSize.width,
                  height: previewSize.height,
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                className="rounded-sm bg-black/5"
                style={{
                  width: previewSize.width,
                  height: previewSize.height,
                }}
              />
            )}
          </div>

          <div
            className="flex min-w-0 flex-1 flex-col"
            style={{ gap: CUSTOMIZE_LAYOUT.sectionGap }}
          >
            <ColorSwatchGrid
              label="frame"
              colors={FRAME_COLOR_SWATCHES}
              selected={frameColor}
              onSelect={setFrameColor}
              columns={CUSTOMIZE_LAYOUT.swatchColumns}
              swatchSize={CUSTOMIZE_LAYOUT.swatchSize}
              swatchGap={CUSTOMIZE_LAYOUT.swatchGap}
            />

            <div
              className="flex flex-col"
              style={{ gap: CUSTOMIZE_LAYOUT.labelToSwatchesGap }}
            >
              <p className="font-mono text-xs text-black">text</p>
              <ColorSwatchGrid
                label="text"
                showLabel={false}
                colors={TEXT_COLOR_SWATCHES}
                selected={textColor}
                onSelect={setTextColor}
                columns={CUSTOMIZE_LAYOUT.swatchColumns}
                swatchSize={CUSTOMIZE_LAYOUT.swatchSize}
                swatchGap={CUSTOMIZE_LAYOUT.swatchGap}
              />
              <input
                type="text"
                value={captionText}
                onChange={(event) => setCaptionText(event.target.value)}
                className="font-cursive w-full bg-transparent text-black outline-none"
                style={{
                  borderRadius: CUSTOMIZE_LAYOUT.inputRadius,
                  border: `1px solid ${CUSTOMIZE_LAYOUT.inputBorder}`,
                  paddingInline: CUSTOMIZE_LAYOUT.inputPaddingX,
                  paddingBlock: CUSTOMIZE_LAYOUT.inputPaddingY,
                  fontSize: CUSTOMIZE_LAYOUT.inputFontSize,
                }}
              />
            </div>
          </div>
        </div>
      </PageContent>
    </PageShell>
  );
}
