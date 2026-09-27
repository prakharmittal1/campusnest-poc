// Client-safe journey-tracking constants (also used by proxy.ts, so no database imports here).

/** Long-lived anonymous visitor id, so activity before sign-up can be attached to the account. */
export const ANON_COOKIE = "cn_aid";
/** First-touch attribution (UTM params + external referrer), copied onto the account at sign-up. */
export const ATTRIBUTION_COOKIE = "cn_src";

export const JOURNEY_EVENT_TYPES = [
  "search",
  "view_city",
  "view_property",
  "select_room",
  "enquiry_sent",
  "signup",
  "login",
  "locale_change",
] as const;

export type JourneyEventType = (typeof JOURNEY_EVENT_TYPES)[number];

/** Event types that the browser may report; the rest are recorded server-side only. */
export const CLIENT_EVENT_TYPES = ["search", "view_city", "view_property", "select_room"] as const;
export type ClientEventType = (typeof CLIENT_EVENT_TYPES)[number];

export type Attribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
};

export function parseAttribution(value: string | undefined): Attribution {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const pick = (key: keyof Attribution) =>
      typeof parsed[key] === "string" ? (parsed[key] as string).slice(0, 300) : undefined;
    return {
      utmSource: pick("utmSource"),
      utmMedium: pick("utmMedium"),
      utmCampaign: pick("utmCampaign"),
      referrer: pick("referrer"),
    };
  } catch {
    return {};
  }
}

const TWO_YEARS = 60 * 60 * 24 * 365 * 2;

export const TRACKING_COOKIE_OPTIONS = {
  maxAge: TWO_YEARS,
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;
