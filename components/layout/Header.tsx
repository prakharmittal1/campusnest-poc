import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { EnquiryModal } from "@/components/enquiry/EnquiryModal";
import { Container } from "@/components/ui/layout";
import { getCountriesWithCities } from "@/lib/queries";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const countries = await getCountriesWithCities();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <Container className="flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
          <nav aria-label="Destinations" className="hidden items-center gap-6 md:flex">
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
          <div className="hidden sm:block">
            <EnquiryModal variant="outline" size="sm">
              Get expert help
            </EnquiryModal>
          </div>
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
