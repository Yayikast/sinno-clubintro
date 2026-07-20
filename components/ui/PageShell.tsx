"use client";

import { theme, getSwatchBoxShadow } from "@/themes";
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
  /** When false, main content does not scroll (e.g. fixed-height step layouts). */
  mainScroll?: boolean;
  footerClassName?: string;
  footerStyle?: CSSProperties;
}

export function PageShell({
  children,
  showBack = false,
  onBack,
  footer,
  maxWidth = theme.layout.page.frameWidth,
  paddingX = theme.layout.page.paddingX,
  paddingY = theme.layout.page.paddingY,
  titleClassName = "font-cursive text-[40px] font-normal leading-none text-black",
  subtitleClassName = "font-mono text-[12px] font-normal leading-normal text-black",
  mainClassName = "",
  mainScroll = true,
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
          src={theme.assets.background}
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
              aria-label={theme.copy.shell.backAriaLabel}
              className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center"
            >
              <Image src={theme.assets.backIcon} alt="" width={20} height={20} />
            </button>
          ) : null}

          <h1 className={titleClassName}>{theme.brand.name}</h1>
          <p className={subtitleClassName}>{theme.brand.tagline}</p>
        </header>

        <main
          className={`flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden ${mainScroll ? "overflow-y-auto overscroll-y-contain" : "overflow-y-hidden"} ${mainClassName}`}
        >
          {children}
        </main>

        {footer ? (
          <footer
            className={`mt-auto flex w-full min-w-0 shrink-0 flex-col items-center overflow-x-hidden ${footerClassName}`}
            style={{
              width: "100%",
              maxWidth: theme.layout.page.contentWidth,
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
      style={{ maxWidth: theme.layout.page.contentWidth, ...style }}
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
      style={{ gap: hint ? theme.layout.page.actionFooter.hintToButtonGap : 0 }}
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
  textSize = theme.layout.page.primaryButton.textSize,
  height = theme.layout.page.primaryButton.height,
  width = theme.layout.page.primaryButton.width,
  borderRadius = theme.layout.page.primaryButton.radius,
}: PinkButtonProps) {
  const buttonColors = theme.colors.button;
  const bgColor = variant === "primary" ? buttonColors.primary : buttonColors.secondary;
  const hoverColor =
    variant === "primary" ? buttonColors.primaryHover : buttonColors.secondaryHover;

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
        backgroundColor: bgColor,
      }}
      onMouseEnter={(event) => {
        if (!disabled) {
          event.currentTarget.style.backgroundColor = hoverColor;
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = bgColor;
      }}
      className={`font-cursive m-0 flex shrink-0 items-center justify-center gap-2 border-0 p-0 font-normal text-black transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
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
  const tabs = theme.layout.addPhoto.modeTabs;
  const tabColors = theme.colors.modeTabs;
  const pillInset = tabs.pillInset;
  const pillSpan = tabs.gap + pillInset * 2;

  return (
    <div
      className="relative mx-auto box-border grid w-full min-w-0 max-w-full grid-cols-2"
      style={{
        width: "100%",
        maxWidth: tabs.width,
        height: tabs.height,
        gap: tabs.gap,
        padding: pillInset,
        borderRadius: tabs.radius,
        backgroundColor: tabColors.trackBg,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute transition-[left] duration-200 ease-out"
        style={{
          top: pillInset,
          bottom: pillInset,
          left: mode === "take" ? pillInset : `calc(50% + ${tabs.gap / 2}px)`,
          width: `calc((100% - ${pillSpan}px) / 2)`,
          borderRadius: tabs.radius - pillInset,
          backgroundColor: tabColors.pillBg,
        }}
      />

      <button
        type="button"
        onClick={() => onChange("take")}
        className="font-cursive relative z-10 m-0 box-border flex items-center justify-center border-0 bg-transparent p-0 text-center font-normal transition-colors"
        style={{
          height: tabs.height - pillInset * 2,
          minHeight: tabs.height - pillInset * 2,
          maxHeight: tabs.height - pillInset * 2,
          fontSize: tabs.fontSize,
          color: mode === "take" ? tabColors.selectedTextColor : tabColors.unselectedTextColor,
        }}
      >
        {theme.copy.addPhoto.modeTake}
      </button>
      <button
        type="button"
        onClick={() => onChange("upload")}
        className="font-cursive relative z-10 m-0 box-border flex items-center justify-center border-0 bg-transparent p-0 text-center font-normal transition-colors"
        style={{
          height: tabs.height - pillInset * 2,
          minHeight: tabs.height - pillInset * 2,
          maxHeight: tabs.height - pillInset * 2,
          fontSize: tabs.fontSize,
          color: mode === "upload" ? tabColors.selectedTextColor : tabColors.unselectedTextColor,
        }}
      >
        {theme.copy.addPhoto.modeUpload}
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
  const countdownLayout = theme.layout.addPhoto.countdown;
  const countdownColors = theme.colors.countdown;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-xs text-black">{theme.copy.addPhoto.countdownLabel}</p>
      <div className="flex" style={{ gap: countdownLayout.gap }}>
        {options.map((seconds) => {
          const isSelected = value === seconds;

          return (
            <button
              key={seconds}
              type="button"
              onClick={() => onChange(seconds)}
              className="font-mono m-0 flex shrink-0 items-center justify-center rounded-full border-0 p-0 text-xs transition-colors"
              style={{
                width: countdownLayout.size,
                height: countdownLayout.size,
                minWidth: countdownLayout.size,
                maxWidth: countdownLayout.size,
                minHeight: countdownLayout.size,
                maxHeight: countdownLayout.size,
                aspectRatio: "1 / 1",
                boxSizing: "border-box",
                backgroundColor: isSelected
                  ? countdownColors.selectedBg
                  : countdownColors.unselectedBg,
                color: isSelected ? countdownColors.selectedColor : countdownColors.unselectedColor,
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
export { getSwatchBoxShadow };
