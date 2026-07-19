"use client";

import { usePhotobooth } from "@/context/PhotoboothProvider";
import { FRAMES } from "@/lib/frames";
import { getLandingPreviewSize, LANDING_LAYOUT } from "@/lib/landingLayout";
import { scaleBoxToFit } from "@/lib/responsiveLayout";
import { useViewportLayout } from "@/hooks/useViewportLayout";
import { PageContent, PageShell, PinkButton, ActionFooter } from "@/components/ui/PageShell";
import { FramePreview, FrameSelector } from "@/components/ui/FramePreview";

export function LandingStep() {
  const { selectedFrameId, selectFrameId, confirmFrameSelection } = usePhotobooth();
  const frame = FRAMES.find((item) => item.id === selectedFrameId) ?? FRAMES[2];
  const previewSize = getLandingPreviewSize(frame.aspectRatio);
  const { contentWidth, contentHeight } = useViewportLayout({
    hasFooter: true,
    designPaddingY: LANDING_LAYOUT.paddingY,
  });
  const widthLimited = Math.min(previewSize.width, contentWidth);
  const heightFromWidth =
    (widthLimited / previewSize.width) * previewSize.height;
  const previewDimensions = scaleBoxToFit(
    widthLimited,
    heightFromWidth,
    contentWidth,
    Math.max(180, contentHeight * 0.58),
  );

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
        <div className="landing-preview-area flex min-h-0 flex-1 items-center justify-center">
          <FramePreview
            frame={frame}
            width={previewDimensions.width}
            height={previewDimensions.height}
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
