"use client";

import { usePhotobooth } from "@/context/PhotoboothProvider";
import { theme, getLandingPreviewSize } from "@/themes";
import { scaleBoxToFit } from "@/lib/responsiveLayout";
import { useViewportLayout } from "@/hooks/useViewportLayout";
import { useIsLandscape } from "@/hooks/useIsLandscape";
import { PageContent, PageShell, PinkButton, ActionFooter } from "@/components/ui/PageShell";
import { LandscapeShell } from "@/components/ui/LandscapeShell";
import { FramePreview, FrameSelector } from "@/components/ui/FramePreview";

export function LandingStep() {
  const { selectedFrameId, selectFrameId, confirmFrameSelection } = usePhotobooth();
  const { list: frames, defaults } = theme.frames;
  const landingLayout = theme.layout.landing;
  const frame = frames.find((item) => item.id === selectedFrameId) ?? frames[2];
  const previewSize = getLandingPreviewSize(frame.aspectRatio);
  const { contentWidth, contentHeight } = useViewportLayout({
    hasFooter: true,
    designPaddingY: landingLayout.paddingY,
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
  const isLandscape = useIsLandscape();

  const frameSelector = (availableWidth?: number) => (
    <FrameSelector
      frames={frames}
      selectedId={selectedFrameId}
      onSelect={(id) => selectFrameId(id as typeof selectedFrameId)}
      itemHeight={landingLayout.selectorHeight}
      selectedSize={landingLayout.selectorSelectedSize}
      selectedBg={landingLayout.selectorSelectedBg}
      selectedRadius={landingLayout.selectorSelectedRadius}
      gap={landingLayout.selectorGap}
      availableWidth={availableWidth}
    />
  );

  const credit = theme.copy.landing.credit ? (
    <p className="font-mono text-center text-xs text-black/45">
      {theme.copy.landing.credit}
    </p>
  ) : null;

  const selectButton = (
    <ActionFooter>
      <PinkButton onClick={confirmFrameSelection}>
        {theme.copy.landing.selectButton}
      </PinkButton>
    </ActionFooter>
  );

  if (isLandscape) {
    return (
      <LandscapeShell
        media={(size) => {
          const fitted = scaleBoxToFit(
            previewSize.width,
            previewSize.height,
            size.width,
            size.height,
          );
          return (
            <FramePreview
              frame={frame}
              width={fitted.width}
              height={fitted.height}
              showPlaceholders={false}
              captionText={defaults.caption}
              textColor={defaults.textColor}
            />
          );
        }}
        controls={(controlsWidth) => (
          <div className="flex flex-1 flex-col justify-center gap-3">
            {frameSelector(controlsWidth)}
            {credit}
          </div>
        )}
        footer={selectButton}
      />
    );
  }

  return (
    <PageShell
      maxWidth={landingLayout.frameWidth}
      paddingX={landingLayout.paddingX}
      paddingY={landingLayout.paddingY}
      footer={selectButton}
    >
      <PageContent
        className="min-h-0 w-full min-w-0 flex-1"
        style={{ marginTop: landingLayout.headerToPreviewGap }}
      >
        <div className="landing-preview-area flex min-h-0 flex-1 items-center justify-center">
          <FramePreview
            frame={frame}
            width={previewDimensions.width}
            height={previewDimensions.height}
            showPlaceholders={false}
            captionText={defaults.caption}
            textColor={defaults.textColor}
          />
        </div>

        <div style={{ marginTop: landingLayout.previewToSelectorGap }}>
          {frameSelector()}
        </div>

        {credit}

        <div
          className="shrink-0"
          style={{ height: landingLayout.selectorToButtonGap }}
        />
      </PageContent>
    </PageShell>
  );
}
