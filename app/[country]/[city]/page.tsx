import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquiryModal } from "@/components/enquiry/EnquiryModal";
import { ListingFilters } from "@/components/listing/ListingFilters";
import { SortSelect } from "@/components/listing/SortSelect";
import { PropertyCard } from "@/components/PropertyCard";
import { buttonClass } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";
import { countActiveFilters, parseListingFilters, type RawSearchParams } from "@/lib/filters";
import { getCity, getCityListing } from "@/lib/queries";

type CityPageProps = {
  params: Promise<{ country: string; city: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { country, city } = await params;
  const found = await getCity(country, city);
  if (!found) return {};
  return {
    title: `Student accommodation in ${found.name}`,
    description: `Compare verified student rooms, studios and apartments in ${found.name}, ${found.country.name}.`,
  };
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const [{ country, city }, rawParams] = await Promise.all([params, searchParams]);
  const filters = parseListingFilters(rawParams);
  const listing = await getCityListing(country, city, filters);
  if (!listing) notFound();

  const { city: cityData, university, results, totalInCity, priceRange } = listing;
  const activeFilterCount = countActiveFilters(filters);

  return (
    <Container className="pt-8">
      <Breadcrumbs
        items={[{ label: cityData.country.name, href: `/${cityData.country.slug}` }, { label: cityData.name }]}
      />

      <h1 className="heading-xl mt-6">
        Student homes in <span className="highlight">{cityData.name}</span>
      </h1>
      <p className="mt-3 text-[17px] text-ink-soft">
        {university
          ? `Near ${university.name}, closest first.`
          : `${totalInCity} verified homes near ${cityData.universities.length} universities.`}
      </p>

      <div className="mt-12 grid gap-8 border-t border-line pt-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside>
          <ListingFilters
            filters={filters}
            universities={cityData.universities.map((u) => ({ slug: u.slug, name: u.name }))}
            priceRange={priceRange}
            market={cityData.country}
            resultCount={results.length}
            activeFilterCount={activeFilterCount}
          />
        </aside>

        <section aria-label="Results">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-ink">
              {results.length} {results.length === 1 ? "home" : "homes"}
              {results.length < totalInCity && ` of ${totalInCity}`}
            </p>
            <SortSelect value={filters.sort} hasUniversity={Boolean(university)} />
          </div>

          {results.length > 0 ? (
            <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((property) => (
                <PropertyCard key={property.slug} property={property} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-panel bg-surface px-6 py-16 text-center">
              <h2 className="heading-md">No homes match those filters</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Try a wider price range or fewer filters — or let an expert search for you.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link
                  href={`/${cityData.country.slug}/${cityData.slug}`}
                  scroll={false}
                  className={buttonClass({ variant: "outline" })}
                >
                  Clear filters
                </Link>
                <EnquiryModal>Ask an expert</EnquiryModal>
              </div>
            </div>
          )}

          <div className="mt-16 flex flex-col items-start justify-between gap-5 border-t border-line pt-8 sm:flex-row sm:items-center">
            <p className="text-[15px] text-ink-soft">
              Can&apos;t find the right room in {cityData.name}? We&apos;ll send you a free shortlist.
            </p>
            <EnquiryModal variant="outline">Get a shortlist</EnquiryModal>
          </div>
        </section>
      </div>
    </Container>
  );
}
