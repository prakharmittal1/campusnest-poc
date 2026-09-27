"use client";

import { LoaderCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { cx } from "@/lib/cx";

type SignInFormProps = {
  googleEnabled: boolean;
  /** Where to land after signing in. Defaults to the current page. */
  callbackPath?: string;
  initialError?: boolean;
};

function currentPath() {
  return `${window.location.pathname}${window.location.search}`;
}

/** Google button plus passwordless email link. New accounts go to the welcome form first. */
export function SignInForm({ googleEnabled, callbackPath, initialError = false }: SignInFormProps) {
  const t = useTranslations("auth");
  const id = useId();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(initialError ? t("error") : null);

  function urls() {
    const next = callbackPath ?? currentPath();
    return {
      callbackURL: next,
      newUserCallbackURL: `/account/welcome?next=${encodeURIComponent(next)}`,
      errorCallbackURL: `/account?error=signin`,
    };
  }

  async function google() {
    setPending("google");
    setError(null);
    const { error } = await authClient.signIn.social({ provider: "google", ...urls() });
    // On success the browser is already on its way to Google.
    if (error) {
      setError(t("error"));
      setPending(null);
    }
  }

  async function sendLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError(t("emailInvalid"));
      return;
    }
    setPending("email");
    setError(null);
    const { error } = await authClient.signIn.magicLink({ email: address, ...urls() });
    setPending(null);
    if (error) setError(t("error"));
    else setSentTo(address);
  }

  if (sentTo) {
    return (
      <div className="py-4 text-center" role="status">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-ink">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <h3 className="heading-md mt-4">{t("checkInboxTitle")}</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{t("checkInboxText", { email: sentTo })}</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSentTo(null)}>
          {t("useDifferentEmail")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {googleEnabled && (
        <>
          <Button variant="outline" size="lg" className="w-full" onClick={google} disabled={pending !== null}>
            {pending === "google" ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <GoogleIcon />}
            {t("google")}
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            {t("or")}
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={sendLink} noValidate className="space-y-3">
        <div>
          <label htmlFor={`${id}-email`} className="block text-[13px] font-semibold text-ink-soft">
            {t("email")}
          </label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            className={cx(
              "mt-1.5 block h-11 w-full rounded-control border bg-white px-3.5 text-sm text-ink focus:border-ink focus:outline-none",
              error ? "border-danger" : "border-line-strong",
            )}
          />
        </div>
        {error && (
          <p className="rounded-control bg-danger-soft px-3.5 py-2.5 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending !== null}>
          {pending === "email" && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {t("emailLink")}
        </Button>
      </form>

      <p className="text-center text-xs text-muted">
        {t.rich("terms", {
          privacy: (chunks) => (
            <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.8l4-3z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}
