import { photoBoothTheme } from "@/themes/photoBooth";
import { sinnoTheme } from "@/themes/sinno";
import type { ThemeId } from "@/themes/types";

export const activeThemeId = "photoBooth" as ThemeId;
// export const activeThemeId = "sinno" as ThemeId;

const THEMES = {
  photoBooth: photoBoothTheme,
  sinno: sinnoTheme,
} as const satisfies Record<ThemeId, typeof photoBoothTheme>;

export const theme = THEMES[activeThemeId];
