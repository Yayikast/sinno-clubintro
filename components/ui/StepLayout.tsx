"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface StepLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export function StepLayout({
  title,
  subtitle,
  children,
  footer,
  onBack,
  showBack = true,
}: StepLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-white">
      <header className="safe-top flex items-center gap-3 px-4 pb-2 pt-4">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-11 w-11 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">{title}</h1>
          {subtitle ? (
            <p className="truncate text-sm text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        {children}
      </main>

      {footer ? (
        <footer className="safe-bottom sticky bottom-0 border-t border-white/10 bg-zinc-950/95 px-4 py-4 backdrop-blur">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}

export function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
}: PrimaryButtonProps) {
  const base =
    "flex h-12 w-full items-center justify-center rounded-full text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const styles =
    variant === "primary"
      ? "bg-white text-zinc-950 hover:bg-zinc-100"
      : "border border-white/20 bg-transparent text-white hover:bg-white/10";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
