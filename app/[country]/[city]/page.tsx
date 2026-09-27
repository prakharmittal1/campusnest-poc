import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TrackEvent } from "@/components/analytics/TrackEvent";
import { BenchmarkNote } from "@/components/BenchmarkNote";
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
  const t = await getTranslations("city");
  return {
    title: t("metaTitle", { city: found.name }),
    description: t("metaDescription", { city: found.name, country: found.country.name }),
  };
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const [{ country, city }, rawParams] = await Promise.all([params, searchParams]);
  const filters = parseListingFilters(rawParams);
  const listing = await getCityListing(country, city, filters);
  if (!listing) notFound();

  const { city: cityData, university, results, totalInCity, priceRange } = listing;
  const activeFilterCount = countActiveFilters(filters);
  const t = await getTranslations("city");

  return (
    <Container className="pt-8">
      <TrackEvent
        type="view_city"
        details={{
          country: cityData.country.name,
          city: cityData.name,
          university: university?.name ?? null,
          rooms: filters.rooms,
          amenities: filters.amenities,
          bills: filters.bills,
          minPrice: filters.minPrice ?? null,
          maxPrice: filters.maxPrice ?? null,
          sort: filters.sort,
          results: results.length,
        }}
      />
      <Breadcrumbs
        items={[{ label: cityData.country.name, href: `/${cityData.country.slug}` }, { label: cityData.name }]}
      />

      <h1 className="heading-xl mt-6">
        {t.rich("title", { city: cityData.name, highlight: (chunks) => <span className="highlight">{chunks}</span> })}
      </h1>
      <p className="mt-3 text-[17px] text-ink-soft">
        {university
          ? t("nearUniversity", { university: university.name })
          : t("summary", { homes: totalInCity, universities: cityData.universities.length })}
      </p>

      <div className="mt-12 grid gap-8 border-t border-line pt-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="space-y-6">
          {cityData.benchmark && (
            <BenchmarkNote benchmark={cityData.benchmark} market={cityData.country} cityName={cityData.name} />
          )}
          <ListingFilters
            filters={filters}
            universities={cityData.universities.map((u) => ({ slug: u.slug, name: u.name }))}
            priceRange={priceRange}
            market={cityData.country}
            resultCount={results.length}
            activeFilterCount={activeFilterCount}
          />
        </aside>

        <section aria-label={t("results")}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-ink">
              {t("resultCount", { count: results.length })}
              {results.length < totalInCity && t("ofTotal", { total: totalInCity })}
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
              <h2 className="heading-md">{t("emptyTitle")}</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                {t("emptyText")}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link
                  href={`/${cityData.country.slug}/${cityData.slug}`}
                  scroll={false}
                  className={buttonClass({ variant: "outline" })}
                >
                  {t("clearFilters")}
                </Link>
                <EnquiryModal>{t("askExpert")}</EnquiryModal>
              </div>
            </div>
          )}

          <div className="mt-16 flex flex-col items-start justify-between gap-5 border-t border-line pt-8 sm:flex-row sm:items-center">
            <p className="text-[15px] text-ink-soft">
              {t("shortlistText", { city: cityData.name })}
            </p>
            <EnquiryModal variant="outline">{t("shortlistButton")}</EnquiryModal>
          </div>
        </section>
      </div>
    </Container>
  );
}
