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
        <span className="select-none text-[8rem] font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          {count}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
