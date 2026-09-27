type Market = { currencySymbol: string; rentPeriod: string };

export function formatMoney(amount: number, market: Market): string {
  return `${market.currencySymbol}${amount.toLocaleString("en-US")}`;
}

/** "week" or "month". Words like "/wk" and "months" are translated with the `common.period*` messages. */
export function rentPeriod(market: Market): "week" | "month" {
  return market.rentPeriod === "month" ? "month" : "week";
}

/** Weekly markets quote tenancies in weeks, monthly markets in months. Pass to the `common.tenancy` message. */
export function tenancy(weeks: number, market: Market): { period: "week" | "month"; count: number } {
  const period = rentPeriod(market);
  return { period, count: period === "month" ? Math.round(weeks / 4.345) : weeks };
}

const MILES_COUNTRIES = new Set(["uk", "usa"]);

export function formatDistance(km: number, countrySlug: string): string {
  if (MILES_COUNTRIES.has(countrySlug)) return `${(km * 0.621371).toFixed(1)} mi`;
  return `${km.toFixed(1)} km`;
}

const WALK_LIMIT_KM = 1.6; // ≈20 minutes on foot

/**
 * Rough door-to-door estimate: walking for short hops, otherwise public transport (never quicker
 * than the walk limit). Pass to the `common.travel` message: t("travel", travelTime(km)).
 */
export function travelTime(km: number): { mode: "walk" | "transit"; minutes: number } {
  if (km <= WALK_LIMIT_KM) return { mode: "walk", minutes: Math.max(1, Math.round((km / 4.8) * 60)) };
  return { mode: "transit", minutes: Math.round(20 + ((km - WALK_LIMIT_KM) / 20) * 60) };
}
