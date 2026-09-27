import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return { title: t("metaTitle") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const sections = [
    { title: t("collectTitle"), text: t("collect") },
    { title: t("useTitle"), text: t("use") },
    { title: t("rightsTitle"), text: t("rights", { email: site.contact.email }) },
  ];

  return (
    <Container className="max-w-2xl pt-12">
      <h1 className="heading-xl">{t("title")}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{t("intro", { site: site.name })}</p>
      {sections.map((section) => (
        <section key={section.title} className="mt-10">
          <h2 className="heading-md">{section.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{section.text}</p>
        </section>
      ))}
    </Container>
  );
}
