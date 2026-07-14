"use client";

import { usePhotobooth } from "@/context/PhotoboothProvider";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { StepLayout } from "@/components/ui/StepLayout";
import type { CountdownSeconds } from "@/types/photobooth";

const COUNTDOWN_OPTIONS: CountdownSeconds[] = [3, 5, 10];

export function CaptureStep() {
  const {
    layout,
    photos,
    countdownSeconds,
    retakeIndex,
    setCountdownSeconds,
    setPhotoAtIndex,
    setPhotos,
    clearRetake,
    goToStep,
    goBack,
  } = usePhotobooth();

  if (!layout) return null;

  const isRetake = retakeIndex !== null;

  return (
    <StepLayout
      title={isRetake ? `Retake photo ${retakeIndex + 1}` : "Take photos"}
      subtitle={layout.label}
      onBack={goBack}
      showBack
      footer={
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-zinc-400">Countdown</span>
            {COUNTDOWN_OPTIONS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => setCountdownSeconds(seconds)}
                className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors ${
                  countdownSeconds === seconds
                    ? "bg-white text-zinc-950"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>
      }
    >
      <CameraCapture
        key={isRetake ? `retake-${retakeIndex}` : "capture"}
        photoCount={layout.photoCount}
        countdownSeconds={countdownSeconds}
        initialPhotos={photos}
        retakeIndex={retakeIndex}
        autoStart={isRetake}
        onPhotoCaptured={(index, photo) => setPhotoAtIndex(index, photo)}
        onComplete={(completedPhotos) => {
          setPhotos(completedPhotos);
          clearRetake();
          goToStep(isRetake ? "review" : "review");
        }}
        onCancel={() => {
          if (isRetake) {
            clearRetake();
            goToStep("review");
          } else {
            goBack();
          }
        }}
      />
    </StepLayout>
  );
}
