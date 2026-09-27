// Client-safe locale settings. The UI language is kept in a cookie (no /fil URL prefix),
// so existing links and routes stay the same in every language.

export const LOCALES = ["en", "fil"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Short labels for the language switcher. */
export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  fil: { short: "FIL", name: "Filipino" },
};

/** BCP 47 tag for dates and numbers. */
export const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", fil: "fil-PH" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Cookie choice first; otherwise Filipino for browsers that ask for Filipino or Tagalog. */
export function resolveLocale(cookieValue: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  const preferred = (acceptLanguage ?? "").split(",").map((part) => part.split(";")[0].trim().toLowerCase());
  for (const tag of preferred) {
    if (tag.startsWith("fil") || tag.startsWith("tl")) return "fil";
    if (tag.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}
