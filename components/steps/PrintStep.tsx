"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotobooth } from "@/context/PhotoboothProvider";
import { downloadStrip } from "@/lib/generateStrip";
import { PageShell, PinkButton } from "@/components/ui/PageShell";

const PRINTING_DURATION_MS = 2500;

export function PrintStep() {
  const { finalStripUrl, reset, goBack } = usePhotobooth();
  const [isPrinting, setIsPrinting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsPrinting(false);
    }, PRINTING_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    if (!finalStripUrl) return;
    downloadStrip(finalStripUrl);
  };

  return (
    <PageShell showBack onBack={goBack}>
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
        <h2 className="font-cursive text-2xl font-bold text-black">
          {isPrinting ? "Printing..." : "Your photostrip is ready!"}
        </h2>

        <div className="relative w-full">
          <div className="mx-auto mb-2 h-3 w-48 rounded-full bg-[#D9D9D9]" />

          <AnimatePresence mode="wait">
            {finalStripUrl ? (
              <motion.div
                key="strip"
                initial={isPrinting ? { y: -40, opacity: 0 } : { y: 0, opacity: 1 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="mx-auto w-full max-w-[220px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={finalStripUrl}
                  alt="Your photostrip"
                  className="w-full rounded-sm shadow-2xl"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isPrinting ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid w-full grid-cols-2 gap-3"
            >
              <PinkButton variant="secondary" onClick={reset}>
                <Image src="/figma/icons/home.svg" alt="" width={18} height={18} />
                Home
              </PinkButton>
              <PinkButton onClick={handleDownload}>
                <Image src="/figma/icons/download.svg" alt="" width={18} height={18} />
                Download
              </PinkButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
