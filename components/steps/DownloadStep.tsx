"use client";

import { Download, RotateCcw } from "lucide-react";
import { downloadStrip } from "@/lib/generateStrip";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { ActionButton, StepLayout } from "@/components/ui/StepLayout";

export function DownloadStep() {
  const { finalStripUrl, reset } = usePhotobooth();

  const handleDownload = () => {
    if (!finalStripUrl) return;
    downloadStrip(finalStripUrl);
  };

  return (
    <StepLayout
      title="Your photostrip"
      subtitle="Save and share your creation"
      showBack={false}
      footer={
        <div className="flex flex-col gap-3">
          <ActionButton onClick={handleDownload} disabled={!finalStripUrl}>
            <span className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download PNG
            </span>
          </ActionButton>
          <ActionButton variant="secondary" onClick={reset}>
            <span className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Start over
            </span>
          </ActionButton>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
        {finalStripUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={finalStripUrl}
            alt="Your photostrip"
            className="w-full rounded-lg shadow-2xl"
          />
        ) : (
          <p className="py-12 text-center text-sm text-zinc-400">
            No photostrip available. Please go back and try again.
          </p>
        )}

        <p className="text-center text-sm text-zinc-400">
          Tap download to save your photostrip to your device.
        </p>
      </div>
    </StepLayout>
  );
}
