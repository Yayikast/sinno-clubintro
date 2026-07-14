"use client";

import { usePhotobooth } from "@/context/PhotoboothProvider";
import { StripPreview } from "@/components/steps/StripPreview";
import { ActionButton, StepLayout } from "@/components/ui/StepLayout";

export function ConfirmPhotos() {
  const { layout, photos, goToStep, goBack } = usePhotobooth();

  if (!layout) return null;

  return (
    <StepLayout
      title="Confirm photos"
      subtitle="Happy with your shots?"
      onBack={goBack}
      footer={
        <ActionButton onClick={() => goToStep("frameColor")}>
          Looks good
        </ActionButton>
      }
    >
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
        <StripPreview layout={layout} photos={photos} />
        <p className="text-center text-sm text-zinc-400">
          These photos will be used for your photostrip. You can still go back
          to retake any photo.
        </p>
      </div>
    </StepLayout>
  );
}
