import { LXGW_WenKai_Mono_TC, Caveat } from "next/font/google";
import { captionFamily } from "@/themes/sinno/fontTokens";

export const fontCursive = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cursive",
});

export const fontMono = LXGW_WenKai_Mono_TC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const fonts = {
  fontCursive,
  fontMono,
  captionFamily,
} as const;
