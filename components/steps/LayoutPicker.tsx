"use client";

import { LAYOUTS } from "@/lib/layouts";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { StepLayout } from "@/components/ui/StepLayout";
import { StripPreview } from "@/components/steps/StripPreview";

export function LayoutPicker() {
  const { selectLayout } = usePhotobooth();

  return (
    <StepLayout
      title="Choose your strip"
      subtitle="Pick a photostrip layout"
      showBack={false}
    >
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <p className="text-center text-sm text-zinc-400">
          Tap a layout to get started
        </p>

        <div className="flex flex-col gap-5">
          {LAYOUTS.map((layout) => (
            <div key={layout.id} className="flex flex-col gap-2">
              <StripPreview
                layout={layout}
                onClick={() => selectLayout(layout)}
              />
              <div className="px-1">
                <p className="text-sm font-medium">{layout.label}</p>
                <p className="text-xs text-zinc-500">{layout.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StepLayout>
  );
}
