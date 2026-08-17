"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { theme } from "@/themes";
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
    <>
      <div className="app-shell h-dvh max-h-dvh w-full max-w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: theme.motion.stepTransitionDurationMs / 1000 }}
            className="h-dvh max-h-dvh w-full max-w-full overflow-hidden"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="orientation-lock h-dvh w-full max-w-full flex-col items-center justify-center gap-4 bg-[var(--background)] px-8 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="6" y="3" width="12" height="18" rx="2" transform="rotate(90 12 12)" />
          <path d="M12 17.5v.01" strokeLinecap="round" />
        </svg>
        <p className="font-cursive text-2xl text-black">Please rotate your device</p>
        <p className="font-mono text-xs text-black/60">
          {theme.brand.name} works best in portrait mode.
        </p>
      </div>
    </>
  );
}
