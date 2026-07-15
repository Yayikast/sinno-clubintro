"use client";

import { AnimatePresence, motion } from "framer-motion";

interface CountdownProps {
  count: number;
}

export function Countdown({ count }: CountdownProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={count}
        role="status"
        aria-live="assertive"
        aria-label={`Countdown: ${count}`}
        className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/80">
          <span className="font-mono select-none text-5xl font-bold text-black">
            {count}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
