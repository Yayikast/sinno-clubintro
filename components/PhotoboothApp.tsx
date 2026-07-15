"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { LandingStep } from "@/components/steps/LandingStep";
import { AddPhotoStep } from "@/components/steps/AddPhotoStep";
import { CustomizeStep } from "@/components/steps/CustomizeStep";
import { PrintStep } from "@/components/steps/PrintStep";

const STEP_COMPONENTS = {
  landing: LandingStep,
  addPhoto: AddPhotoStep,
  customize: CustomizeStep,
  print: PrintStep,
} as const;

export function PhotoboothApp() {
  const { step } = usePhotobooth();
  const StepComponent = STEP_COMPONENTS[step];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2 }}
        className="min-h-dvh"
      >
        <StepComponent />
      </motion.div>
    </AnimatePresence>
  );
}
