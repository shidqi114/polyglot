"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export const cn = clsx;

type Variant = "primary" | "secondary" | "blue" | "danger" | "ghost" | "gold";

const VARIANTS: Record<Variant, { cls: string; shadow?: string }> = {
  primary: { cls: "bg-primary text-white hover:brightness-105", shadow: "var(--primary-dark)" },
  blue: { cls: "bg-blue text-white hover:brightness-105", shadow: "var(--blue-dark)" },
  danger: { cls: "bg-red text-white hover:brightness-105", shadow: "var(--red-dark)" },
  gold: { cls: "bg-gold text-white hover:brightness-105", shadow: "var(--gold-dark)" },
  secondary: { cls: "bg-surface text-text border-2 border-border hover:bg-surface-2", shadow: "var(--border)" },
  ghost: { cls: "bg-transparent text-muted hover:bg-surface-2" },
};

export function Button({
  variant = "primary",
  className,
  style,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const v = VARIANTS[variant];
  return (
    <button
      {...rest}
      style={{ ...(v.shadow ? ({ "--shadow": v.shadow } as CSSProperties) : null), ...style }}
      className={cn(
        "inline-flex min-h-12 select-none items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold uppercase tracking-wide",
        v.shadow && "btn-3d",
        "disabled:bg-locked disabled:text-muted disabled:[--shadow:var(--locked-dark)] disabled:border-transparent",
        v.cls,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value, className, color = "var(--primary)" }: { value: number; className?: string; color?: string }) {
  return (
    <div className={cn("h-4 w-full overflow-hidden rounded-full bg-locked", className)}>
      <div
        className="relative h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }}
      >
        <div className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border-2 border-border bg-surface p-4", className)}>{children}</div>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-locked")}
    >
      <span
        className={cn(
          "absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}
