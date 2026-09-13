import { cache } from "react";
import type { Country, Property, RoomType } from "@/generated/prisma/client";
import type { SearchResult } from "./constants";
import type { ListingFilters } from "./filters";
import { haversineKm } from "./geo";
import { prisma } from "./prisma";

export type PropertyCardData = {
  slug: string;
  name: string;
  area: string;
  image: string;
  rating: number;
  reviewCount: number;
  billsIncluded: boolean;
  href: string;
  country: Pick<Country, "slug" | "currencySymbol" | "rentPeriod">;
  cityName: string;
  /** Cheapest available room (after filters), or null when every room is sold out. */
  fromPrice: number | null;
  distance?: { km: number; universityName: string };
};

type CardSource = Property & {
  city: { slug: string; name: string; country: Country };
  roomTypes: RoomType[];
};

function toCardData(property: CardSource, distance?: PropertyCardData["distance"]): PropertyCardData {
  const available = property.roomTypes.filter((room) => room.available);
  return {
    slug: property.slug,
    name: property.name,
    area: property.area,
    image: property.images[0] ?? "",
    rating: property.rating,
    reviewCount: property.reviewCount,
    billsIncluded: property.billsIncluded,
    href: `/${property.city.country.slug}/${property.city.slug}/${property.slug}`,
    country: {
      slug: property.city.country.slug,
      currencySymbol: property.city.country.currencySymbol,
      rentPeriod: property.city.country.rentPeriod,
    },
    cityName: property.city.name,
    fromPrice: available.length ? Math.min(...available.map((room) => room.price)) : null,
    distance,
  };
}

// Used by the header, footer and home page on every request; cache() runs it once per request.
export const getCountriesWithCities = cache(async () =>
  prisma.country.findMany({
    orderBy: { id: "asc" },
    include: {
      cities: {
        orderBy: { id: "asc" },
        include: { _count: { select: { properties: true, universities: true } } },
      },
    },
  }),
);

export async function getFeaturedProperties(limit = 4): Promise<PropertyCardData[]> {
  const properties = await prisma.property.findMany({
    where: { featured: true },
    orderBy: { rating: "desc" },
    take: limit,
    include: { city: { include: { country: true } }, roomTypes: true },
  });
  return properties.map((property) => toCardData(property));
}

export const getCountry = cache(async (countrySlug: string) =>
  prisma.country.findUnique({
    where: { slug: countrySlug },
    include: {
      cities: {
        orderBy: { id: "asc" },
        include: {
          universities: { orderBy: { name: "asc" } },
          _count: { select: { properties: true } },
        },
      },
    },
  }),
);

// cache() dedupes the lookup shared by generateMetadata and the page within one request.
export const getCity = cache(async (countrySlug: string, citySlug: string) =>
  prisma.city.findFirst({
    where: { slug: citySlug, country: { slug: countrySlug } },
    include: { country: true },
  }),
);

export async function getCityListing(countrySlug: string, citySlug: string, filters: ListingFilters) {
  const city = await prisma.city.findFirst({
    where: { slug: citySlug, country: { slug: countrySlug } },
    include: { country: true, universities: { orderBy: { name: "asc" } } },
  });
  if (!city) return null;

  // A property matches when at least one available room satisfies the room/price filters;
  // its "from" price is then the cheapest of those matching rooms.
  const roomWhere = {
    available: true,
    ...(filters.rooms.length > 0 && { category: { in: filters.rooms } }),
    price: { gte: filters.minPrice, lte: filters.maxPrice },
  };

  const [properties, priceRange, totalInCity] = await Promise.all([
    prisma.property.findMany({
      where: {
        cityId: city.id,
        ...(filters.bills && { billsIncluded: true }),
        ...(filters.amenities.length > 0 && { amenities: { hasEvery: filters.amenities } }),
        roomTypes: { some: roomWhere },
      },
      include: { roomTypes: { where: roomWhere } },
    }),
    prisma.roomType.aggregate({
      where: { property: { cityId: city.id } },
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.property.count({ where: { cityId: city.id } }),
  ]);

  const university = city.universities.find((u) => u.slug === filters.university);

  const ranked = properties
    .map((property) => ({
      featured: property.featured,
      card: toCardData(
        { ...property, city },
        university ? { km: haversineKm(university, property), universityName: university.name } : undefined,
      ),
    }))
    .sort((a, b) => {
      switch (filters.sort) {
        case "price_asc":
          return (a.card.fromPrice ?? Infinity) - (b.card.fromPrice ?? Infinity);
        case "price_desc":
          return (b.card.fromPrice ?? 0) - (a.card.fromPrice ?? 0);
        case "distance":
          return (a.card.distance?.km ?? 0) - (b.card.distance?.km ?? 0);
        default:
          return Number(b.featured) - Number(a.featured) || b.card.rating - a.card.rating;
      }
    });

  return {
    city,
    university,
    results: ranked.map((r) => r.card),
    totalInCity,
    priceRange: { min: priceRange._min.price ?? 0, max: priceRange._max.price ?? 0 },
  };
}

export const getProperty = cache(async (countrySlug: string, citySlug: string, propertySlug: string) => {
  const property = await prisma.property.findFirst({
    where: { slug: propertySlug, city: { slug: citySlug, country: { slug: countrySlug } } },
    include: {
      city: { include: { country: true, universities: true } },
      roomTypes: { orderBy: [{ available: "desc" }, { price: "asc" }] },
      reviews: { orderBy: { id: "asc" } },
    },
  });
  if (!property) return null;

  const similar = await prisma.property.findMany({
    where: { cityId: property.cityId, id: { not: property.id } },
    orderBy: { rating: "desc" },
    take: 3,
    include: { city: { include: { country: true } }, roomTypes: true },
  });

  const universities = property.city.universities
    .map((university) => ({ ...university, km: haversineKm(university, property) }))
    .sort((a, b) => a.km - b.km);

  return {
    property,
    images: property.images,
    amenities: property.amenities,
    badges: property.badges,
    universities,
    similar: similar.map((p) => toCardData(p)),
  };
});

export async function searchAll(query: string): Promise<SearchResult[]> {
  const term = query.trim();
  if (term.length < 2) return [];

  const match = { contains: term, mode: "insensitive" as const };
  const [countries, cities, universities, properties] = await Promise.all([
    prisma.country.findMany({ where: { name: match }, take: 3 }),
    prisma.city.findMany({ where: { name: match }, include: { country: true }, take: 5 }),
    prisma.university.findMany({
      where: { OR: [{ name: match }, { slug: match }] },
      include: { city: { include: { country: true } } },
      take: 5,
    }),
    prisma.property.findMany({
      where: { OR: [{ name: match }, { area: match }] },
      include: { city: { include: { country: true } } },
      take: 5,
    }),
  ]);

  return [
    ...countries.map((c): SearchResult => ({
      type: "country",
      label: c.name,
      sublabel: "Country",
      href: `/${c.slug}`,
    })),
    ...cities.map((c): SearchResult => ({
      type: "city",
      label: c.name,
      sublabel: c.country.name,
      href: `/${c.country.slug}/${c.slug}`,
    })),
    ...universities.map((u): SearchResult => ({
      type: "university",
      label: u.name,
      sublabel: `${u.city.name}, ${u.city.country.name}`,
      href: `/${u.city.country.slug}/${u.city.slug}?university=${u.slug}`,
    })),
    ...properties.map((p): SearchResult => ({
      type: "property",
      label: p.name,
      sublabel: `${p.area}, ${p.city.name}`,
      href: `/${p.city.country.slug}/${p.city.slug}/${p.slug}`,
    })),
  ];
}
