"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { LayoutPicker } from "@/components/steps/LayoutPicker";
import { CaptureStep } from "@/components/steps/CaptureStep";
import { PhotoReview } from "@/components/steps/PhotoReview";
import { ConfirmPhotos } from "@/components/steps/ConfirmPhotos";
import { FrameColorPicker } from "@/components/steps/FrameColorPicker";
import { ConfirmFrame } from "@/components/steps/ConfirmFrame";
import { DownloadStep } from "@/components/steps/DownloadStep";

const STEP_COMPONENTS = {
  layout: LayoutPicker,
  capture: CaptureStep,
  review: PhotoReview,
  confirmPhotos: ConfirmPhotos,
  frameColor: FrameColorPicker,
  confirmFrame: ConfirmFrame,
  download: DownloadStep,
} as const;

export function PhotoboothApp() {
  const { step } = usePhotobooth();
  const StepComponent = STEP_COMPONENTS[step];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="min-h-dvh"
      >
        <StepComponent />
      </motion.div>
    </AnimatePresence>
  );
}
