"use client";

import { usePhotobooth } from "@/context/PhotoboothProvider";
import { FRAMES } from "@/lib/frames";
import { PageShell, PinkButton } from "@/components/ui/PageShell";
import { FramePreview, FrameSelector } from "@/components/ui/FramePreview";

export function LandingStep() {
  const { selectedFrameId, selectFrameId, confirmFrameSelection } = usePhotobooth();
  const frame = FRAMES.find((item) => item.id === selectedFrameId) ?? FRAMES[2];

  return (
    <PageShell
      footer={
        <PinkButton onClick={confirmFrameSelection}>Select</PinkButton>
      }
    >
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8">
        <FramePreview
          frame={frame}
          size="lg"
          showPlaceholders={false}
        />

        <FrameSelector
          frames={FRAMES}
          selectedId={selectedFrameId}
          onSelect={(id) => selectFrameId(id as typeof selectedFrameId)}
        />
      </div>
    </PageShell>
  );
}
