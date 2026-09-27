"use client";

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/app/actions/locale";
import { cx } from "@/lib/cx";
import { LOCALE_LABELS, LOCALES } from "@/lib/i18n";

/** "EN | FIL" toggle. The choice is kept in a cookie, so URLs stay the same in every language. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("language");
  const current = useLocale();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cx("flex items-center rounded-control p-0.5 ring-1 ring-inset ring-line", pending && "opacity-60", className)}
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-pressed={locale === current}
          aria-label={t("switchTo", { language: LOCALE_LABELS[locale].name })}
          disabled={pending}
          onClick={() => {
            if (locale === current) return;
            startTransition(async () => {
              await setLocale(locale, pathname);
              // Full reload so every client component (and the switcher itself) picks up the new language.
              window.location.reload();
            });
          }}
          className={cx(
            "h-7 rounded-[6px] px-2 text-xs font-bold transition-colors",
            locale === current ? "bg-ink text-white" : "text-muted hover:text-ink",
          )}
        >
          {LOCALE_LABELS[locale].short}
        </button>
      ))}
    </div>
  );
}
