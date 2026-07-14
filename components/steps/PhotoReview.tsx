"use client";

import { RotateCcw } from "lucide-react";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { StripPreview } from "@/components/steps/StripPreview";
import { ActionButton, StepLayout } from "@/components/ui/StepLayout";

export function PhotoReview() {
  const { layout, photos, startRetake, goToStep, goBack } = usePhotobooth();

  if (!layout) return null;

  const allFilled = photos.every((photo) => photo !== null);

  return (
    <StepLayout
      title="Review photos"
      subtitle="Retake any photo you don't like"
      onBack={goBack}
      footer={
        <ActionButton
          onClick={() => goToStep("confirmPhotos")}
          disabled={!allFilled}
        >
          Continue
        </ActionButton>
      }
    >
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <StripPreview layout={layout} photos={photos} />

        <div className="grid gap-3">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
            >
              <div className="h-16 w-12 overflow-hidden rounded-md bg-zinc-800">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                    Empty
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">Photo {index + 1}</p>
                <p className="text-xs text-zinc-500">
                  {photo ? "Captured" : "Not taken yet"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => startRetake(index)}
                disabled={!photo}
                className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-medium transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </button>
            </div>
          ))}
        </div>
      </div>
    </StepLayout>
  );
}
