import { assets } from "@/themes/sinno/assets";
import { brand } from "@/themes/sinno/brand";
import { colors } from "@/themes/sinno/colors";
import { copy } from "@/themes/sinno/copy";
import { fonts } from "@/themes/sinno/fonts";
import { frames } from "@/themes/sinno/frames";
import { layout } from "@/themes/sinno/layout";
import { metadata } from "@/themes/sinno/metadata";
import { typography } from "@/themes/sinno/typography";
import type { Theme, ThemeMotion } from "@/themes/types";

const motion: ThemeMotion = {
  stepTransitionDurationMs: 200,
  printDurationMs: layout.print.printingDurationMs,
  flashDurationMs: 150,
  captureDelayMs: 150,
  batchCaptureDelayMs: 600,
};

export const sinnoTheme: Theme = {
  id: "sinno",
  brand,
  metadata,
  colors,
  typography,
  assets,
  copy,
  frames,
  layout,
  motion,
  fonts: {
    captionFamily: fonts.captionFamily,
  },
};
