import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SignInForm } from "@/components/auth/SignInForm";
import { Container } from "@/components/ui/layout";
import { authProviders } from "@/lib/auth";
import { getCountryNames, getProfile } from "@/lib/profile";
import { getSession } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("metaTitle"), robots: { index: false } };
}

type AccountPageProps = { searchParams: Promise<{ error?: string }> };

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const [session, { error }, t, tAuth] = await Promise.all([
    getSession(),
    searchParams,
    getTranslations("account"),
    getTranslations("auth"),
  ]);

  if (!session) {
    return (
      <Container className="max-w-md pt-16">
        <h1 className="heading-lg">{tAuth("dialogTitle")}</h1>
        <p className="mb-8 mt-2 text-[15px] text-muted">{tAuth("dialogDescription")}</p>
        <SignInForm googleEnabled={authProviders.google} callbackPath="/account" initialError={Boolean(error)} />
      </Container>
    );
  }

  const [profile, countries] = await Promise.all([getProfile(session.user.id), getCountryNames()]);
  if (!profile) return null;

  return (
    <Container className="max-w-2xl pt-12">
      <h1 className="heading-xl">{t("title")}</h1>
      <p className="mb-10 mt-3 text-[15px] text-muted">{t("description")}</p>
      <ProfileForm profile={profile} countries={countries} />
    </Container>
  );
}
