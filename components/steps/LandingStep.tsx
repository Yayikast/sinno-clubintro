"use client";

import { usePhotobooth } from "@/context/PhotoboothProvider";
import { FRAMES } from "@/lib/frames";
import { getLandingPreviewSize, LANDING_LAYOUT } from "@/lib/landingLayout";
import { PageContent, PageShell, PinkButton, ActionFooter } from "@/components/ui/PageShell";
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
        <ActionFooter>
          <PinkButton onClick={confirmFrameSelection}>Select</PinkButton>
        </ActionFooter>
      }
    >
      <PageContent
        className="min-h-0 w-full min-w-0 flex-1"
        style={{ marginTop: LANDING_LAYOUT.headerToPreviewGap }}
      >
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <FramePreview
            frame={frame}
            width={Math.min(previewSize.width, LANDING_LAYOUT.frameWidth - LANDING_LAYOUT.paddingX * 2)}
            height={
              (Math.min(previewSize.width, LANDING_LAYOUT.frameWidth - LANDING_LAYOUT.paddingX * 2) /
                previewSize.width) *
              previewSize.height
            }
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
      </PageContent>
    </PageShell>
  );
}
