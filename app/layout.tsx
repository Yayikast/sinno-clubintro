import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { theme, themeFonts } from "@/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: theme.metadata.title,
  description: theme.metadata.description,
  icons: {
    icon: theme.metadata.favicon,
    apple: theme.metadata.appleIcon,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: theme.metadata.appleWebAppTitle,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: theme.brand.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${themeFonts.fontCursive.variable} ${themeFonts.fontMono.variable} h-full antialiased`}
      style={
        {
          "--background": theme.colors.background,
          "--foreground": theme.colors.foreground,
        } as React.CSSProperties
      }
    >
      <body
        className="min-h-dvh overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]"
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
