import type { Metadata, Viewport } from "next";
import { fontCursive, fontMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhotoBooth",
  description: "Capture the moments — mobile photobooth web app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PhotoBooth",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFF5F7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontCursive.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh overflow-x-hidden bg-[#FFF5F7] text-black">
        {children}
      </body>
    </html>
  );
}
