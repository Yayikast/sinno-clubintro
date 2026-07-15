"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { FRAME_COLOR_SWATCHES, TEXT_COLOR_SWATCHES } from "@/lib/frames";
import { generateStrip } from "@/lib/generateStrip";
import {
  ColorSwatchGrid,
  PageShell,
  PinkButton,
} from "@/components/ui/PageShell";
import { FramePreview } from "@/components/ui/FramePreview";

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
    }, 300);

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
        <PinkButton onClick={handlePrint}>
          <Image src="/figma/icons/print.svg" alt="" width={20} height={20} />
          Print
        </PinkButton>
      }
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <h2 className="font-cursive text-center text-2xl font-bold text-black">
          Customize your frame &lt;3
        </h2>

        <div className="flex gap-4">
          <div className="w-[42%] shrink-0">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Strip preview"
                className="w-full rounded-sm shadow-lg"
              />
            ) : (
              <FramePreview
                frame={frame}
                photos={photos}
                frameColor={frameColor}
                textColor={textColor}
                captionText={captionText}
                size="sm"
              />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <ColorSwatchGrid
              label="frame"
              colors={FRAME_COLOR_SWATCHES}
              selected={frameColor}
              onSelect={setFrameColor}
              columns={3}
            />

            <ColorSwatchGrid
              label="text"
              colors={TEXT_COLOR_SWATCHES}
              selected={textColor}
              onSelect={setTextColor}
              columns={3}
            />

            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs text-black">text</p>
              <input
                type="text"
                value={captionText}
                onChange={(event) => setCaptionText(event.target.value)}
                className="font-cursive w-full rounded-xl border border-black/30 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-[#FFA8BD]"
              />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
