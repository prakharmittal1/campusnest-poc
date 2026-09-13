import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/ui/layout";
import { Tag } from "@/components/ui/Tag";
import { getCountry } from "@/lib/queries";

type CountryPageProps = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const country = await getCountry((await params).country);
  if (!country) return {};
  return { title: `Student accommodation in ${country.name}` };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const country = await getCountry((await params).country);
  if (!country) notFound();

  return (
    <Container className="pt-8">
      <Breadcrumbs items={[{ label: country.name }]} />
      <h1 className="heading-xl mt-6">
        Student homes in <span className="highlight">{country.name}</span>
      </h1>
      <p className="mt-4 text-[17px] text-ink-soft">
        {country.cities.length} cities · Prices in {country.currencyCode} per {country.rentPeriod}
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {country.cities.map((city) => (
          <article key={city.id} className="rounded-card border border-line p-6">
            <Link href={`/${country.slug}/${city.slug}`} className="group flex items-center justify-between gap-4">
              <div>
                <h2 className="heading-md group-hover:underline group-hover:underline-offset-4">{city.name}</h2>
                <p className="mt-1 text-sm text-muted">{city._count.properties} homes</p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface transition-colors group-hover:bg-accent">
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">Near university</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {city.universities.map((u) => (
                <li key={u.id}>
                  <Link href={`/${country.slug}/${city.slug}?university=${u.slug}`}>
                    <Tag className="font-medium transition-colors hover:bg-accent-soft hover:text-ink">{u.name}</Tag>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Container>
  );
}
