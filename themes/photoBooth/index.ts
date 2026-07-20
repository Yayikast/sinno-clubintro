import { assets } from "@/themes/photoBooth/assets";
import { brand } from "@/themes/photoBooth/brand";
import { colors } from "@/themes/photoBooth/colors";
import { copy } from "@/themes/photoBooth/copy";
import { fonts } from "@/themes/photoBooth/fonts";
import { frames } from "@/themes/photoBooth/frames";
import { layout } from "@/themes/photoBooth/layout";
import { metadata } from "@/themes/photoBooth/metadata";
import { typography } from "@/themes/photoBooth/typography";
import type { Theme, ThemeMotion } from "@/themes/types";

const motion: ThemeMotion = {
  stepTransitionDurationMs: 200,
  printDurationMs: layout.print.printingDurationMs,
  flashDurationMs: 150,
  captureDelayMs: 150,
  batchCaptureDelayMs: 600,
};

export const photoBoothTheme: Theme = {
  id: "photoBooth",
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
