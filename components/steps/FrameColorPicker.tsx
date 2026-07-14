"use client";

import { Check } from "lucide-react";
import { FRAME_COLORS } from "@/lib/layouts";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { ActionButton, StepLayout } from "@/components/ui/StepLayout";

export function FrameColorPicker() {
  const { frameColor, setFrameColor, goToStep, goBack } = usePhotobooth();

  return (
    <StepLayout
      title="Choose frame color"
      subtitle="Pick a color for your photostrip"
      onBack={goBack}
      footer={
        <ActionButton onClick={() => goToStep("confirmFrame")}>
          Continue
        </ActionButton>
      }
    >
      <div className="mx-auto grid w-full max-w-sm grid-cols-3 gap-4">
        {FRAME_COLORS.map((color) => {
          const isSelected = frameColor === color.value;

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => setFrameColor(color.value)}
              className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-colors ${
                isSelected ? "bg-white/15 ring-2 ring-white" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="relative">
                <div
                  className="h-14 w-14 rounded-full border border-white/20 shadow-inner"
                  style={{ backgroundColor: color.value }}
                />
                {isSelected ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check
                      className={`h-6 w-6 ${
                        color.id === "white" || color.id === "blush" || color.id === "gold"
                          ? "text-zinc-900"
                          : "text-white"
                      }`}
                    />
                  </div>
                ) : null}
              </div>
              <span className="text-xs font-medium">{color.label}</span>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}
