import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/**
 * primary — navy, the default action.
 * accent  — yellow, reserved for the one key action per view (search, send enquiry).
 * outline — quiet secondary action.
 * ghost   — text-like action.
 */
export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; className?: string };

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink-soft",
  accent: "bg-accent text-ink hover:bg-accent-strong",
  outline: "bg-white text-ink ring-1 ring-inset ring-line-strong hover:ring-ink",
  ghost: "text-ink hover:bg-surface",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
};

/**
 * Button styles, for anything that should look like a button (links, dialog triggers…).
 * `className` is appended, not merged: use it for layout (margins, width, position), not to
 * override the variant's colours or the size's height/padding — conflicting utilities won't reliably win.
 */
export function buttonClass({ variant = "primary", size = "md", className }: StyleProps = {}): string {
  return cx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({ variant, size, className, ...props }: ComponentProps<"button"> & StyleProps) {
  return <button type="button" {...props} className={buttonClass({ variant, size, className })} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link {...props} className={buttonClass({ variant, size, className })} />;
}
