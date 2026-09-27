/** Next 12 months. Values stay in English (they're read by our team); labels follow the UI language. */
export function nextTwelveMonths(intlLocale: string) {
  const now = new Date();
  const format = (date: Date, locale: string) => date.toLocaleDateString(locale, { month: "long", year: "numeric" });
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { value: format(date, "en-GB"), label: format(date, intlLocale) };
  });
}
