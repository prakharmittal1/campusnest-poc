"use client";

import { Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useId, type ReactNode } from "react";
import { saveProfile, skipWelcome, type ProfileField, type ProfileState } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { INTL_LOCALE } from "@/lib/i18n";
import { nextTwelveMonths } from "@/lib/months";

export type ProfileValues = Partial<Record<ProfileField, string | null>> & {
  email: string;
  consentToShare: boolean;
};

type ProfileFormProps = {
  profile: ProfileValues;
  countries: string[];
  /** "welcome" after the first sign-in: redirects to `next` when saved, and can be skipped. */
  mode?: "profile" | "welcome";
  next?: string;
};

const initialState: ProfileState = { status: "idle" };

export function ProfileForm({ profile, countries, mode = "profile", next = "/" }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);
  const t = useTranslations("account");
  const locale = useLocale();
  const id = useId();

  const error = (name: ProfileField) => state.fieldErrors?.[name];
  const value = (name: ProfileField) => state.values?.[name] ?? profile[name] ?? "";
  const inputClass = (name: ProfileField) =>
    cx(
      "mt-1.5 block h-11 w-full rounded-control border bg-white px-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none",
      error(name) ? "border-danger" : "border-line-strong",
    );
  const props = (name: ProfileField) => ({
    id: `${id}-${name}`,
    name,
    defaultValue: value(name),
    className: inputClass(name),
    "aria-invalid": error(name) ? true : undefined,
    "aria-describedby": error(name) ? `${id}-${name}-error` : undefined,
  });
  const field = (name: ProfileField, label: string, input: ReactNode) => (
    <div>
      <label htmlFor={`${id}-${name}`} className="block text-[13px] font-semibold text-ink-soft">
        {label}
      </label>
      {input}
      {error(name) && (
        <p id={`${id}-${name}-error`} className="mt-1 text-xs text-danger">
          {error(name)}
        </p>
      )}
    </div>
  );

  const months = nextTwelveMonths(INTL_LOCALE[locale]);
  const savedMonth = value("studyStart");
  const consentChecked = state.values ? state.values.consentToShare === "on" : profile.consentToShare;

  return (
    <form action={formAction} noValidate className="space-y-8">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="next" value={next} />

      <fieldset className="space-y-4">
        <legend className="heading-md mb-4">{t("contactSection")}</legend>
        {field("name", t("name"), <input {...props("name")} autoComplete="name" />)}
        <div>
          <p className="block text-[13px] font-semibold text-ink-soft">{t("email")}</p>
          <p className="mt-1.5 flex h-11 items-center rounded-control bg-surface px-3.5 text-sm text-ink-soft">{profile.email}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("phone", t("phone"), <input {...props("phone")} type="tel" autoComplete="tel" placeholder={t("phonePlaceholder")} />)}
          {field("nationality", t("nationality"), <input {...props("nationality")} autoComplete="country-name" />)}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="heading-md mb-4">{t("plansSection")}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {field(
            "destinationCountry",
            t("destinationCountry"),
            <select {...props("destinationCountry")}>
              <option value="">{t("anyCountry")}</option>
              {countries.map((country) => (
                <option key={country}>{country}</option>
              ))}
            </select>,
          )}
          {field("destinationCity", t("destinationCity"), <input {...props("destinationCity")} placeholder={t("cityPlaceholder")} />)}
        </div>
        {field("university", t("university"), <input {...props("university")} placeholder={t("universityPlaceholder")} />)}
        <div className="grid gap-4 sm:grid-cols-2">
          {field(
            "studyStart",
            t("studyStart"),
            <select {...props("studyStart")}>
              <option value="">{t("notSure")}</option>
              {/* Keep a saved month that has since passed selectable. */}
              {savedMonth && !months.some((m) => m.value === savedMonth) && <option value={savedMonth}>{savedMonth}</option>}
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>,
          )}
          {field("budget", t("budget"), <input {...props("budget")} placeholder={t("budgetPlaceholder")} />)}
        </div>
      </fieldset>

      <div className="rounded-card bg-surface p-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-ink">
          <input type="checkbox" name="consentToShare" defaultChecked={consentChecked} className="mt-0.5 size-4 shrink-0 accent-ink" />
          {t("consent")}
        </label>
        <p className="mt-2 pl-7 text-xs leading-relaxed text-muted">
          {t.rich("privacyNote", {
            privacy: (chunks) => (
              <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>

      {state.status === "error" && state.message && (
        <p className="rounded-control bg-danger-soft px-3.5 py-2.5 text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="accent" size="lg" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {mode === "welcome" ? t("saveContinue") : t("save")}
        </Button>
        {mode === "welcome" && (
          <Button type="submit" variant="ghost" size="lg" formAction={skipWelcome} formNoValidate>
            {t("skip")}
          </Button>
        )}
        {state.status === "success" && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink" role="status">
            <Check className="size-4" aria-hidden />
            {t("saved")}
          </span>
        )}
      </div>
    </form>
  );
}
