"use client";

import { usePhotobooth } from "@/context/PhotoboothProvider";
import { FRAMES } from "@/lib/frames";
import { getLandingPreviewSize, LANDING_LAYOUT } from "@/lib/landingLayout";
import { PageShell, PinkButton } from "@/components/ui/PageShell";
import { FramePreview, FrameSelector } from "@/components/ui/FramePreview";

export function LandingStep() {
  const { selectedFrameId, selectFrameId, confirmFrameSelection } = usePhotobooth();
  const frame = FRAMES.find((item) => item.id === selectedFrameId) ?? FRAMES[2];
  const previewSize = getLandingPreviewSize(frame.aspectRatio);

  return (
    <PageShell
      maxWidth={LANDING_LAYOUT.frameWidth}
      paddingX={LANDING_LAYOUT.paddingX}
      paddingY={LANDING_LAYOUT.paddingY}
      footer={
        <div className="flex justify-center">
          <PinkButton
            onClick={confirmFrameSelection}
            textSize={LANDING_LAYOUT.buttonTextSize}
            width={LANDING_LAYOUT.buttonWidth}
            height={LANDING_LAYOUT.buttonHeight}
            borderRadius={LANDING_LAYOUT.buttonRadius}
          >
            Select
          </PinkButton>
        </div>
      }
    >
      <div
        className="flex min-h-0 flex-1 flex-col items-center"
        style={{ marginTop: LANDING_LAYOUT.headerToPreviewGap }}
      >
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <FramePreview
            frame={frame}
            width={previewSize.width}
            height={previewSize.height}
            captionSize={LANDING_LAYOUT.captionSize}
            showPlaceholders={false}
          />
        </div>

        <div style={{ marginTop: LANDING_LAYOUT.previewToSelectorGap }}>
          <FrameSelector
            frames={FRAMES}
            selectedId={selectedFrameId}
            onSelect={(id) => selectFrameId(id as typeof selectedFrameId)}
            itemHeight={LANDING_LAYOUT.selectorHeight}
            selectedSize={LANDING_LAYOUT.selectorSelectedSize}
            selectedBg={LANDING_LAYOUT.selectorSelectedBg}
            selectedRadius={LANDING_LAYOUT.selectorSelectedRadius}
            gap={LANDING_LAYOUT.selectorGap}
          />
        </div>

        <div
          className="shrink-0"
          style={{ height: LANDING_LAYOUT.selectorToButtonGap }}
        />
      </div>
    </PageShell>
  );
}
