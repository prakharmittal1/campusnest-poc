import { Star } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { SelectedRoomProvider } from "@/components/enquiry/SelectedRoomContext";
import { Faq } from "@/components/Faq";
import { Gallery } from "@/components/property/Gallery";
import { MapView } from "@/components/property/MapView";
import { RoomTypeList } from "@/components/property/RoomTypeList";
import { PropertyCard } from "@/components/PropertyCard";
import { buttonClass } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";
import { DistanceTag, Tag } from "@/components/ui/Tag";
import { propertyFaqs, propertyPolicies } from "@/content/property";
import { AMENITIES, AMENITY_GROUPS, isAmenityKey } from "@/lib/amenities";
import { formatDistance, formatMoney, formatTravelTime, periodLong, periodShort } from "@/lib/format";
import { getProperty } from "@/lib/queries";

type PropertyPageProps = {
  params: Promise<{ country: string; city: string; property: string }>;
};

/** Universities further than this are left off the map (they'd zoom it out too far). */
const MAP_RADIUS_KM = 12;

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { country, city, property } = await params;
  const data = await getProperty(country, city, property);
  if (!data) return {};
  return {
    title: `${data.property.name}, ${data.property.city.name}`,
    description: data.property.description,
  };
}

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-24">
      <h2 className="heading-lg">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { country, city, property: propertySlug } = await params;
  const data = await getProperty(country, city, propertySlug);
  if (!data) notFound();

  const { property, images, amenities, badges, universities, similar } = data;
  const market = property.city.country;
  const availableRooms = property.roomTypes.filter((room) => room.available);
  const fromPrice = availableRooms.length ? Math.min(...availableRooms.map((room) => room.price)) : null;
  const nearest = universities[0];
  const amenityKeys = amenities.filter(isAmenityKey);
  const mapUniversities = universities.filter((u, i) => i === 0 || u.km <= MAP_RADIUS_KM);
  const highlights = [...(property.billsIncluded ? ["Bills included"] : []), ...badges];

  const faqs = propertyFaqs({
    propertyName: property.name,
    billsIncluded: property.billsIncluded,
    period: periodLong(market),
    nearest: nearest && {
      name: nearest.name,
      distance: formatDistance(nearest.km, market.slug),
      travel: formatTravelTime(nearest.km),
    },
  });

  return (
    <SelectedRoomProvider>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: market.name, href: `/${market.slug}` },
            { label: property.city.name, href: `/${market.slug}/${property.city.slug}` },
            { label: property.name },
          ]}
        />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <p className="text-sm font-semibold text-muted">
              {property.propertyType} · {property.area}, {property.city.name}
            </p>
            <h1 className="heading-xl mt-2">{property.name}</h1>
          </div>
          <a href="#reviews" className="flex items-center gap-1.5 pb-2 text-sm text-muted hover:text-ink">
            <Star className="size-4 fill-accent text-accent-strong" aria-hidden />
            <span className="font-bold text-ink">{property.rating.toFixed(1)}</span>· {property.reviewCount} reviews
          </a>
        </div>

        <div className="mt-8">
          <Gallery images={images} name={property.name} />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div className="min-w-0">
            <p className="max-w-2xl text-[17px] leading-relaxed text-ink-soft">{property.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {nearest && (
                <li>
                  <DistanceTag>
                    {formatTravelTime(nearest.km)} · {nearest.name}
                  </DistanceTag>
                </li>
              )}
              {highlights.map((item) => (
                <li key={item}>
                  <Tag>{item}</Tag>
                </li>
              ))}
            </ul>

            <Section id="rooms" title="Rooms and prices">
              <RoomTypeList rooms={property.roomTypes} market={market} />
            </Section>

            <Section title="What's included">
              <div className="grid gap-8 sm:grid-cols-3">
                {AMENITY_GROUPS.map((group) => {
                  const items = amenityKeys.filter((key) => AMENITIES[key].group === group);
                  if (items.length === 0) return null;
                  return (
                    <div key={group}>
                      <h3 className="text-sm font-bold text-ink">{group}</h3>
                      <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                        {items.map((key) => (
                          <li key={key}>{AMENITIES[key].label}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section title="Location">
              <p className="-mt-3 mb-5 text-sm text-muted">{property.address}</p>
              <MapView
                property={{ name: property.name, lat: property.lat, lng: property.lng }}
                universities={mapUniversities.map((u) => ({ name: u.name, lat: u.lat, lng: u.lng }))}
              />
              <ul className="mt-6 border-t border-line">
                {universities.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-4 border-b border-line py-3 text-sm">
                    <span className="text-ink-soft">{u.name}</span>
                    <span className="shrink-0 text-right text-muted">
                      {formatDistance(u.km, market.slug)} · {formatTravelTime(u.km)}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="reviews" title="Reviews">
              <p className="-mt-3 flex items-center gap-1.5 text-sm text-muted">
                <Star className="size-4 fill-accent text-accent-strong" aria-hidden />
                <span className="font-bold text-ink">{property.rating.toFixed(1)}</span> average from {property.reviewCount} students
              </p>
              <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
                {property.reviews.map((review) => (
                  <li key={review.id} className="border-t border-line py-5">
                    <p className="text-[15px] leading-relaxed text-ink-soft">“{review.text}”</p>
                    <p className="mt-3 text-[13px] text-muted">
                      <span className="font-semibold text-ink">{review.authorName}</span> · {review.universityName} · {review.rating}/5
                    </p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Good to know">
              <dl className="grid gap-x-10 sm:grid-cols-2">
                {propertyPolicies({ badges }).map(({ term, detail }) => (
                  <div key={term} className="border-t border-line py-5">
                    <dt className="text-[15px] font-bold text-ink">{term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted">{detail}</dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section title="Questions">
              <Faq items={faqs} />
            </Section>
          </div>

          <aside id="enquire" className="scroll-mt-24">
            <div className="rounded-panel border border-line p-7 shadow-sm lg:sticky lg:top-24">
              <p className="text-sm text-muted">
                {fromPrice !== null ? (
                  <>
                    From <span className="text-3xl font-extrabold tracking-tight text-ink">{formatMoney(fromPrice, market)}</span>{" "}
                    /{periodLong(market)}
                  </>
                ) : (
                  "Currently sold out — join the waitlist"
                )}
              </p>
              <p className="mb-6 mt-1 text-sm text-muted">Ask an expert about availability and contracts.</p>
              <EnquiryForm
                propertyId={property.id}
                propertyName={property.name}
                roomOptions={property.roomTypes.map((room) => room.name)}
              />
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-28">
            <h2 className="heading-lg">More homes in {property.city.name}</h2>
            <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard key={p.slug} property={p} />
              ))}
            </div>
          </section>
        )}
      </Container>

      {/* Mobile: keep price and the enquiry CTA in reach while scrolling. */}
      <div className="sticky bottom-0 z-30 mt-10 flex items-center justify-between gap-4 border-t border-line bg-canvas px-5 py-3 lg:hidden">
        <p className="text-sm text-muted">
          {fromPrice !== null ? (
            <>
              <span className="text-lg font-extrabold text-ink">{formatMoney(fromPrice, market)}</span> /{periodShort(market)}
            </>
          ) : (
            "Sold out"
          )}
        </p>
        <a href="#enquire" className={buttonClass({ variant: "accent" })}>
          Enquire
        </a>
      </div>
    </SelectedRoomProvider>
  );
}
