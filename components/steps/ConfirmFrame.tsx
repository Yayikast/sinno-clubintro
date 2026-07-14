"use client";

import { useEffect, useRef, useState } from "react";
import { generateStrip } from "@/lib/generateStrip";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { StripPreview } from "@/components/steps/StripPreview";
import { ActionButton, StepLayout } from "@/components/ui/StepLayout";
import type { LayoutConfig } from "@/types/photobooth";

interface StripGeneratorProps {
  photos: string[];
  layout: LayoutConfig;
  frameColor: string;
  onGenerated: (url: string) => void;
  onError: () => void;
}

function StripGenerator({
  photos,
  layout,
  frameColor,
  onGenerated,
  onError,
}: StripGeneratorProps) {
  const onGeneratedRef = useRef(onGenerated);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onGeneratedRef.current = onGenerated;
    onErrorRef.current = onError;
  }, [onError, onGenerated]);

  useEffect(() => {
    let cancelled = false;

    generateStrip(photos, layout, frameColor)
      .then((url) => {
        if (!cancelled) {
          onGeneratedRef.current(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          onErrorRef.current();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [frameColor, layout, photos]);

  return (
    <div className="flex w-full flex-col items-center gap-3 py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      <p className="text-sm text-zinc-400">Composing your strip...</p>
    </div>
  );
}

export function ConfirmFrame() {
  const { layout, photos, frameColor, setFinalStripUrl, goToStep, goBack } =
    usePhotobooth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  if (!layout) return null;

  const filledPhotos = photos.filter((photo): photo is string => photo !== null);
  const generationKey = `${frameColor}-${filledPhotos.join("|")}`;

  const handleGenerated = (url: string) => {
    setPreviewUrl(url);
    setFinalStripUrl(url);
    setHasError(false);
  };

  return (
    <StepLayout
      title="Confirm frame"
      subtitle="Preview your final photostrip"
      onBack={goBack}
      footer={
        <ActionButton
          onClick={() => goToStep("download")}
          disabled={!previewUrl}
        >
          Continue to download
        </ActionButton>
      }
    >
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
        {!previewUrl ? (
          <StripGenerator
            key={generationKey}
            photos={filledPhotos}
            layout={layout}
            frameColor={frameColor}
            onGenerated={handleGenerated}
            onError={() => setHasError(true)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Final photostrip preview"
            className="w-full rounded-lg shadow-2xl"
          />
        )}

        {hasError ? (
          <StripPreview layout={layout} photos={photos} frameColor={frameColor} />
        ) : null}
      </div>
    </StepLayout>
  );
}
