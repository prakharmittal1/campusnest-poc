import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { UserMenu } from "@/components/auth/UserMenu";
import { Logo } from "@/components/brand/Logo";
import { EnquiryModal } from "@/components/enquiry/EnquiryModal";
import { Container } from "@/components/ui/layout";
import { authProviders } from "@/lib/auth";
import { getCountriesWithCities } from "@/lib/queries";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const [countries, t] = await Promise.all([getCountriesWithCities(), getTranslations("header")]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <Container className="flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label={t("homeLabel")}>
            <Logo />
          </Link>
          <nav aria-label={t("destinations")} className="hidden items-center gap-6 md:flex">
            {countries.map((country) => (
              <Link
                key={country.id}
                href={`/${country.slug}`}
                className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {country.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Wrapper controls visibility: the button's own display class would override `hidden`. */}
          <LanguageSwitcher className="hidden sm:flex" />
          <div className="hidden sm:block">
            <EnquiryModal variant="outline" size="sm">
              {t("getExpertHelp")}
            </EnquiryModal>
          </div>
          <UserMenu googleEnabled={authProviders.google} />
          <MobileNav
            countries={countries.map((c) => ({
              slug: c.slug,
              name: c.name,
              cities: c.cities.map((city) => ({ slug: city.slug, name: city.name })),
            }))}
          />
        </div>
      </Container>
    </header>
  );
}
