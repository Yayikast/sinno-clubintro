"use client";

import { AnimatePresence, motion } from "framer-motion";
import { theme } from "@/themes";

interface CameraFlashProps {
  show: boolean;
}

export function CameraFlash({ show }: CameraFlashProps) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-40 bg-white"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: theme.motion.flashDurationMs / 1000 }}
        />
      ) : null}
    </AnimatePresence>
  );
}
