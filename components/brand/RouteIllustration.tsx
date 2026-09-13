import { LOGO_PIN_PATH, LOGO_ROOF_PATH } from "./Logo";

/**
 * Hero artwork: a tiny street map with a walking route from a home pin to campus.
 * Inline SVG + text labels (no image requests); decorative, so hidden from screen readers.
 */
export function RouteIllustration() {
  return (
    <div aria-hidden className="relative aspect-[5/4] w-full overflow-hidden rounded-panel bg-surface">
      <svg viewBox="0 0 500 400" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
        {/* Streets */}
        <g className="stroke-white" strokeWidth="18" strokeLinecap="round" fill="none">
          <path d="M-20 110H520M-20 290H520M140-20V420M360-20V420" />
          <path d="M-20 400 250 180 520-40" strokeWidth="12" />
        </g>
        {/* Park block */}
        <rect x="170" y="310" width="160" height="70" rx="12" className="fill-surface-strong" />
        {/* Campus block */}
        <rect x="385" y="20" width="100" height="72" rx="12" className="fill-white" />
        {/* Walking route */}
        <path
          d="M140 290V200H360V110"
          fill="none"
          className="stroke-ink"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0.1 12"
        />
        {/* Campus marker */}
        <g transform="translate(360 110)">
          <circle r="22" className="fill-ink" />
          <path d="M-11 -2 0 -8 11 -2 0 4z M-6 1v6c3 3 9 3 12 0V1" className="stroke-white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        </g>
        {/* Home marker: the logo pin */}
        <g transform="translate(112 232) scale(1.75)">
          <path d={LOGO_PIN_PATH} className="fill-ink" />
          <path d={LOGO_ROOF_PATH} fill="none" className="stroke-accent" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>

      {/* Labels are HTML so they use the site font and stay crisp. */}
      <div className="absolute left-[6%] top-[82%] rounded-card bg-white px-3.5 py-2.5 shadow-sm ring-1 ring-line">
        <p className="text-[13px] font-bold text-ink">Your studio</p>
        <p className="text-xs text-muted">Bills included</p>
      </div>
      <div className="absolute left-[34%] top-[42%] rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-ink">
        8 min walk
      </div>
      <div className="absolute right-[5%] top-[37%] rounded-card bg-white px-3.5 py-2.5 shadow-sm ring-1 ring-line">
        <p className="text-[13px] font-bold text-ink">Campus</p>
        <p className="text-xs text-muted">Lectures at 9:00</p>
      </div>
    </div>
  );
}
