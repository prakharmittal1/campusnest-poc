type Market = { currencySymbol: string; rentPeriod: string };

export function formatMoney(amount: number, market: Market): string {
  return `${market.currencySymbol}${amount.toLocaleString("en-US")}`;
}

export function periodShort(market: Market): string {
  return market.rentPeriod === "month" ? "mo" : "wk";
}

export function periodLong(market: Market): string {
  return market.rentPeriod === "month" ? "month" : "week";
}

/** "£239/wk" or "C$1,450/mo" */
export function formatRent(amount: number, market: Market): string {
  return `${formatMoney(amount, market)}/${periodShort(market)}`;
}

/** Weekly markets quote tenancies in weeks, monthly markets in months. */
export function formatTenancy(weeks: number, market: Market): string {
  if (market.rentPeriod === "month") return `${Math.round(weeks / 4.345)} months`;
  return `${weeks} weeks`;
}

const MILES_COUNTRIES = new Set(["uk", "usa"]);

export function formatDistance(km: number, countrySlug: string): string {
  if (MILES_COUNTRIES.has(countrySlug)) return `${(km * 0.621371).toFixed(1)} mi`;
  return `${km.toFixed(1)} km`;
}

const WALK_LIMIT_KM = 1.6; // ≈20 minutes on foot

/** Rough door-to-door estimate: walking for short hops, otherwise public transport (never quicker than the walk limit). */
export function formatTravelTime(km: number): string {
  if (km <= WALK_LIMIT_KM) return `${Math.max(1, Math.round((km / 4.8) * 60))} min walk`;
  return `${Math.round(20 + ((km - WALK_LIMIT_KM) / 20) * 60)} min by transit`;
}
