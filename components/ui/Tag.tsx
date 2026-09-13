import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Small neutral label, e.g. "UK" or "Bills included". */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-md bg-surface px-2 py-0.5 text-xs font-semibold text-ink-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Wayfinding-style label with the brand's yellow dot, e.g. "8 min walk · UCL". */
export function DistanceTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Tag className={cx("text-ink", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-accent ring-2 ring-accent-soft" />
      {children}
    </Tag>
  );
}
