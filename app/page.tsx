import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { RouteIllustration } from "@/components/brand/RouteIllustration";
import { EnquiryModal } from "@/components/enquiry/EnquiryModal";
import { Faq } from "@/components/Faq";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { Container, SectionHeading } from "@/components/ui/layout";
import { Tag } from "@/components/ui/Tag";
import { HOME_FAQS, HOW_IT_WORKS } from "@/content/home";
import { periodShort } from "@/lib/format";
import { getCountriesWithCities, getFeaturedProperties } from "@/lib/queries";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [countries, featured] = await Promise.all([getCountriesWithCities(), getFeaturedProperties()]);

  const cities = countries.flatMap((country) =>
    country.cities.map((city) => ({ ...city, country, href: `/${country.slug}/${city.slug}` })),
  );

  return (
    <>
      <Container className="grid items-center gap-12 pb-20 pt-12 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <div className="min-w-0">
          <h1 className="heading-xl">
            Find your student home <span className="highlight">near campus</span>.
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink-soft">{site.description}</p>

          <div className="mt-8 max-w-xl">
            <SearchBar />
          </div>

          <p className="mt-4 text-sm text-muted">
            Popular:{" "}
            {cities.slice(0, 4).map((city, i) => (
              <span key={city.id}>
                {i > 0 && ", "}
                <Link href={city.href} className="font-semibold text-ink underline-offset-4 hover:underline">
                  {city.name}
                </Link>
              </span>
            ))}
          </p>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {site.promises.map((promise) => (
              <li key={promise} className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                <Check className="size-4 text-ink" strokeWidth={2.5} aria-hidden />
                {promise}
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden md:block">
          <RouteIllustration />
        </div>
      </Container>

      <section id="destinations" className="scroll-mt-20 border-t border-line py-20">
        <Container>
          <SectionHeading
            title="Explore by city"
            description="Rent is shown the way each market quotes it — per week or per month."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <li key={city.id}>
                <Link
                  href={city.href}
                  className="group flex items-center justify-between gap-4 rounded-card border border-line p-5 transition-colors hover:border-ink"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="heading-md">{city.name}</span>
                      <Tag>
                        {city.country.currencySymbol}/{periodShort(city.country)}
                      </Tag>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {city._count.properties} homes · {city._count.universities} universities
                    </p>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface transition-colors group-hover:bg-accent">
                    <ArrowRight className="size-4 text-ink" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-line py-20">
        <Container>
          <SectionHeading title="Top-rated homes" description="What students are enquiring about this week." />
          <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-surface py-20">
        <Container>
          <SectionHeading title="How it works" />
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <li key={step.title}>
                <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-ink">
                  {i + 1}
                </span>
                <h3 className="heading-md mt-4">{step.title}</h3>
                <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="grid gap-10 py-20 md:grid-cols-[1fr_1.5fr]">
        <div>
          <h2 className="heading-lg">Questions, answered</h2>
          <p className="mt-2 text-[15px] text-muted">Can&apos;t see yours? Our experts reply within 24 hours.</p>
        </div>
        <Faq items={HOME_FAQS} />
      </Container>

      <Container>
        <section className="flex flex-col items-start justify-between gap-6 rounded-panel bg-ink px-7 py-10 text-white sm:flex-row sm:items-center sm:px-12 sm:py-14">
          <div>
            <h2 className="heading-lg">Not sure where to start?</h2>
            <p className="mt-2 max-w-md text-[15px] text-white/70">
              Tell us your university and budget — we&apos;ll send a free shortlist within 24 hours.
            </p>
          </div>
          <EnquiryModal variant="accent" size="lg">
            Get my free shortlist
          </EnquiryModal>
        </section>
      </Container>
    </>
  );
}
