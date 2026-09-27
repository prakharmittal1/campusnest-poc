import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/account/ProfileForm";
import { Container } from "@/components/ui/layout";
import { getCountryNames, getProfile } from "@/lib/profile";
import { getSession } from "@/lib/session";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("welcomeMetaTitle"), robots: { index: false } };
}

type WelcomePageProps = { searchParams: Promise<{ next?: string }> };

/** Shown once, right after a new account is created. */
export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const [session, { next }, t] = await Promise.all([getSession(), searchParams, getTranslations("account")]);
  if (!session) redirect("/account");

  const [profile, countries] = await Promise.all([getProfile(session.user.id), getCountryNames()]);
  if (!profile) redirect("/account");

  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  // Most students will be Filipino; pre-fill for Filipino-language visitors, editable either way.
  const nationality = profile.nationality ?? (profile.locale === "fil" ? "Filipino" : null);

  return (
    <Container className="max-w-2xl pt-12">
      <h1 className="heading-xl">{t("welcomeTitle", { site: site.name })}</h1>
      <p className="mb-10 mt-3 text-[15px] text-muted">{t("welcomeDescription")}</p>
      <ProfileForm profile={{ ...profile, nationality }} countries={countries} mode="welcome" next={safeNext} />
    </Container>
  );
}
