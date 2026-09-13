import { cx } from "@/lib/cx";
import { site } from "@/lib/site";

// Geometry shared with app/icon.svg, app/apple-icon.tsx and app/opengraph-image.tsx.
export const LOGO_PIN_PATH = "M16 30.5S5.5 21.2 5.5 12.9a10.5 10.5 0 0 1 21 0C26.5 21.2 16 30.5 16 30.5z";
export const LOGO_ROOF_PATH = "M10.75 15.25 16 10.25l5.25 5";

/**
 * The CampusNest mark: a map pin with a roof inside — "your home, located".
 * Navy pin, yellow roof: the two brand colours in one symbol.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cx("size-7 shrink-0", className)}>
      <path d={LOGO_PIN_PATH} className="fill-ink" />
      <path
        d={LOGO_ROOF_PATH}
        fill="none"
        className="stroke-accent"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5", className)}>
      <LogoMark />
      <span className="text-lg font-extrabold tracking-[-0.04em] text-ink">
        campus<span className="text-muted">nest</span>
      </span>
      <span className="sr-only">{site.name}</span>
    </span>
  );
}
