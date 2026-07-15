import { LXGW_WenKai_Mono_TC, Caveat } from "next/font/google";

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
