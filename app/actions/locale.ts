"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { recordEvent } from "@/lib/journey";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ANON_COOKIE } from "@/lib/tracking";

/** Switches the UI language. Setting the cookie re-renders the current page in the new language. */
export async function setLocale(locale: Locale, path: string): Promise<void> {
  if (!isLocale(locale)) return;
  const [cookieStore, session] = await Promise.all([cookies(), getSession().catch(() => null)]);
  cookieStore.set(LOCALE_COOKIE, locale, { maxAge: 60 * 60 * 24 * 365, sameSite: "lax", path: "/" });

  const userId = session?.user.id;
  if (userId) {
    await prisma.user.update({ where: { id: userId }, data: { locale } }).catch(() => undefined);
  }
  const anonymousId = cookieStore.get(ANON_COOKIE)?.value;
  if (anonymousId) {
    await recordEvent({
      type: "locale_change",
      anonymousId,
      userId,
      path: typeof path === "string" && path.startsWith("/") ? path : "/",
      data: { locale },
    });
  }
}
