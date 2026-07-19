"use client";

import { ADD_PHOTO_LAYOUT } from "@/lib/addPhotoLayout";
import { PAGE_LAYOUT } from "@/lib/pageLayout";
import { getResponsivePaddingY } from "@/lib/responsiveLayout";
import Image from "next/image";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  footer?: ReactNode;
  /** Max content width in px (Figma frame width). */
  maxWidth?: number;
  paddingX?: number;
  paddingY?: number;
  titleClassName?: string;
  subtitleClassName?: string;
  mainClassName?: string;
  footerClassName?: string;
  footerStyle?: CSSProperties;
}

export function PageShell({
  children,
  showBack = false,
  onBack,
  footer,
  maxWidth = PAGE_LAYOUT.frameWidth,
  paddingX = PAGE_LAYOUT.paddingX,
  paddingY = PAGE_LAYOUT.paddingY,
  titleClassName = "font-cursive text-[40px] font-normal leading-none text-black",
  subtitleClassName = "font-mono text-[12px] font-normal leading-normal text-black",
  mainClassName = "",
  footerClassName = "",
  footerStyle,
}: PageShellProps) {
  const [paddingTop, setPaddingTop] = useState(paddingY);

  useEffect(() => {
    const update = () => {
      const viewportHeight =
        window.visualViewport?.height ?? document.documentElement.clientHeight;
      setPaddingTop(getResponsivePaddingY(viewportHeight, paddingY));
    };

    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, [paddingY]);

  return (
    <div className="relative mx-auto flex h-full w-full max-w-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/figma/decorations/background.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      <div
        className="mx-auto box-border flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden"
        style={{
          maxWidth,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          paddingTop: `max(${paddingTop}px, calc(${paddingTop}px + env(safe-area-inset-top, 0px)))`,
          paddingBottom: `max(${paddingTop}px, calc(${paddingTop}px + env(safe-area-inset-bottom, 0px)))`,
        }}
      >
        <header className="relative shrink-0 text-center">
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center"
            >
              <Image src="/figma/icons/back.svg" alt="" width={20} height={20} />
            </button>
          ) : null}

          <h1 className={titleClassName}>PhotoBooth</h1>
          <p className={subtitleClassName}>- capture the moments -</p>
        </header>

        <main
          className={`flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain ${mainClassName}`}
        >
          {children}
        </main>

        {footer ? (
          <footer
            className={`mt-auto flex w-full min-w-0 shrink-0 flex-col items-center overflow-x-hidden ${footerClassName}`}
            style={{
              width: "100%",
              maxWidth: PAGE_LAYOUT.contentWidth,
              marginInline: "auto",
              ...footerStyle,
            }}
          >
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Centered content column inside the 32px side margins. */
export function PageContent({
  children,
  className = "",
  style,
}: PageContentProps) {
  return (
    <div
      className={`mx-auto box-border flex w-full min-w-0 max-w-full flex-col items-stretch overflow-hidden ${className}`}
      style={{ maxWidth: PAGE_LAYOUT.contentWidth, ...style }}
    >
      {children}
    </div>
  );
}

interface ActionFooterProps {
  children: ReactNode;
  hint?: ReactNode;
}

/** Footer action area — optional hint, then centered primary button (56px page inset below). */
export function ActionFooter({ children, hint }: ActionFooterProps) {
  return (
    <div
      className="flex w-full flex-col items-center"
      style={{ gap: hint ? PAGE_LAYOUT.actionFooter.hintToButtonGap : 0 }}
    >
      {hint ? (
        <div className="font-mono text-center text-xs text-black">{hint}</div>
      ) : null}
      <div className="flex justify-center">{children}</div>
    </div>
  );
}

interface PinkButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
  textSize?: number;
  height?: number;
  width?: number;
  borderRadius?: number;
}

export function PinkButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  textSize = PAGE_LAYOUT.primaryButton.textSize,
  height = PAGE_LAYOUT.primaryButton.height,
  width = PAGE_LAYOUT.primaryButton.width,
  borderRadius = PAGE_LAYOUT.primaryButton.radius,
}: PinkButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-[#FFDEE6] hover:bg-[#ffcddd]"
      : "bg-[#FFEDF1] hover:bg-[#ffe4ea]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width,
        height,
        minHeight: height,
        maxHeight: height,
        fontSize: textSize,
        borderRadius,
        boxSizing: "border-box",
      }}
      className={`font-cursive m-0 flex shrink-0 items-center justify-center gap-2 border-0 p-0 font-normal text-black transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

interface ModeTabsProps {
  mode: "take" | "upload";
  onChange: (mode: "take" | "upload") => void;
}

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  const tabs = ADD_PHOTO_LAYOUT.modeTabs;

  return (
    <div
      className="mx-auto box-border flex w-full min-w-0 max-w-full"
      style={{
        width: "100%",
        maxWidth: tabs.width,
        height: tabs.height,
        gap: tabs.gap,
        borderRadius: tabs.radius,
        borderColor: tabs.borderColor,
      }}
    >
      <button
        type="button"
        onClick={() => onChange("take")}
        className="font-cursive m-0 box-border flex flex-1 items-center justify-center border border-solid p-0 text-center font-normal transition-colors rounded-[6px]"
        style={{
          height: tabs.height,
          minHeight: tabs.height,
          maxHeight: tabs.height,
          fontSize: tabs.fontSize,
          borderColor: tabs.borderColor,
          backgroundColor: mode === "take" ? "#FFFFFF" : "rgba(255, 255, 255, 0.45)",
          color: mode === "take" ? tabs.selectedColor : tabs.unselectedColor,
        }}
      >
        Take Photos
      </button>
      <button
        type="button"
        onClick={() => onChange("upload")}
        className="font-cursive m-0 box-border flex flex-1 items-center justify-center border border-solid p-0 text-center font-normal transition-colors rounded-[6px]"
        style={{
          height: tabs.height,
          minHeight: tabs.height,
          maxHeight: tabs.height,
          fontSize: tabs.fontSize,
          borderColor: tabs.borderColor,
          backgroundColor: mode === "upload" ? "#FFFFFF" : "rgba(255, 255, 255, 0.45)",
          color: mode === "upload" ? tabs.selectedColor : tabs.unselectedColor,
        }}
      >
        Upload
      </button>
    </div>
  );
}

interface CountdownPickerProps {
  value: 3 | 5 | 10;
  onChange: (value: 3 | 5 | 10) => void;
}

export function CountdownPicker({ value, onChange }: CountdownPickerProps) {
  const options = [3, 5, 10] as const;
  const countdown = ADD_PHOTO_LAYOUT.countdown;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-xs text-black">select countdown</p>
      <div className="flex" style={{ gap: countdown.gap }}>
        {options.map((seconds) => {
          const isSelected = value === seconds;

          return (
            <button
              key={seconds}
              type="button"
              onClick={() => onChange(seconds)}
              className="font-mono m-0 flex shrink-0 items-center justify-center rounded-full border-0 bg-white p-0 text-xs transition-colors"
              style={{
                width: countdown.size,
                height: countdown.size,
                minWidth: countdown.size,
                maxWidth: countdown.size,
                minHeight: countdown.size,
                maxHeight: countdown.size,
                aspectRatio: "1 / 1",
                boxSizing: "border-box",
                color: isSelected ? countdown.selectedColor : countdown.unselectedColor,
              }}
            >
              {seconds}s
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { ColorSwatchGrid } from "@/components/ui/ColorSwatchGrid";
