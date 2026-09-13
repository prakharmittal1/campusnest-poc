import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/layout";
import { getCountriesWithCities } from "@/lib/queries";
import { site } from "@/lib/site";

export async function Footer() {
  const countries = await getCountriesWithCities();

  return (
    <footer className="mt-20 border-t border-line">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-60 text-sm leading-relaxed text-muted">{site.tagline}</p>
          <p className="mt-4 text-sm text-muted">
            {site.contact.phone}
            <br />
            {site.contact.email}
          </p>
        </div>

        {countries.map((country) => (
          <div key={country.id}>
            <Link href={`/${country.slug}`} className="text-sm font-bold text-ink">
              {country.name}
            </Link>
            <ul className="mt-3 space-y-2">
              {country.cities.map((city) => (
                <li key={city.id}>
                  <Link
                    href={`/${country.slug}/${city.slug}`}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="border-t border-line py-6">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {site.name} · Prototype — properties, prices and reviews are demo data.
        </p>
      </Container>
    </footer>
  );
}
