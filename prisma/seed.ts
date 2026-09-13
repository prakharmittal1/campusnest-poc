// Seeds demo data. All property names, addresses, prices and reviews are fictional;
// university names and coordinates are real so distances look plausible.
// Uses a fixed-seed PRNG so every run produces identical data.
//
// Safe to run on every deploy: it does nothing if listings already exist.
// Set SEED_RESET=1 to wipe listings (and enquiries/feedback) and re-seed.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { AMENITIES, BASIC_AMENITIES, type AmenityKey } from "../lib/amenities";
import type { RoomCategory } from "../lib/constants";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL_UNPOOLED ?? process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL,
  }),
});

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260913);
const between = (min: number, max: number) => min + rand() * (max - min);
const chance = (p: number) => rand() < p;
const pick = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];
function sample<T>(items: readonly T[], n: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=75`;

const INTERIOR_PHOTOS = [
  "1522708323590-d24dbb6b0267",
  "1502672260266-1c1ef2d93688",
  "1560448204-e02f11c3d0e2",
  "1493809842364-78817add7ffb",
  "1505691938895-1758d7feb511",
  "1540518614846-7eded433c457",
  "1554995207-c18c203602cb",
  "1484154218962-a197022b5858",
  "1519710164239-da123dc03ef4",
  "1513694203232-719a280e022f",
  "1536376072261-38c75010e6c9",
  "1598928506311-c55ded91a20c",
  "1586023492125-27b2c045efd7",
  "1555854877-bab0e564b8d5",
  "1631049307264-da0ec9d70304",
  "1600585154340-be6161a56a0c",
  "1616594039964-ae9021a400a0",
  "1560185007-cde436f6a4d0",
].map(unsplash);

type PriceBands = Record<RoomCategory, [number, number]>;

type UniversitySeed = { slug: string; name: string; lat: number; lng: number };
type PropertySeed = { name: string; area: string; nearUniversity: number };
type CitySeed = {
  slug: string;
  name: string;
  priceFactor: number;
  universities: UniversitySeed[];
  properties: PropertySeed[];
};
type CountrySeed = {
  slug: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  rentPeriod: "week" | "month";
  priceStep: number;
  prices: PriceBands;
  tenancyWeeks: number[];
  cities: CitySeed[];
};

const COUNTRIES: CountrySeed[] = [
  {
    slug: "uk",
    name: "United Kingdom",
    currencyCode: "GBP",
    currencySymbol: "£",
    rentPeriod: "week",
    priceStep: 5,
    prices: { SHARED: [135, 185], ENSUITE: [175, 240], STUDIO: [240, 330], APARTMENT: [340, 460] },
    tenancyWeeks: [44, 51],
    cities: [
      {
        slug: "london",
        name: "London",
        priceFactor: 1.4,
        universities: [
          { slug: "ucl", name: "University College London", lat: 51.5246, lng: -0.134 },
          { slug: "kcl", name: "King's College London", lat: 51.5115, lng: -0.116 },
          { slug: "imperial", name: "Imperial College London", lat: 51.4988, lng: -0.1749 },
          { slug: "qmul", name: "Queen Mary University of London", lat: 51.5246, lng: -0.0403 },
        ],
        properties: [
          { name: "Camden Yard", area: "Camden", nearUniversity: 0 },
          { name: "Bankside Studios", area: "Southwark", nearUniversity: 1 },
          { name: "Kensington Row", area: "South Kensington", nearUniversity: 2 },
          { name: "Mile End Works", area: "Mile End", nearUniversity: 3 },
          { name: "Kings Cross Lofts", area: "King's Cross", nearUniversity: 0 },
        ],
      },
      {
        slug: "manchester",
        name: "Manchester",
        priceFactor: 0.95,
        universities: [
          { slug: "manchester-uni", name: "University of Manchester", lat: 53.4668, lng: -2.2339 },
          { slug: "mmu", name: "Manchester Metropolitan University", lat: 53.4706, lng: -2.239 },
        ],
        properties: [
          { name: "Oxford Road Residence", area: "Oxford Road", nearUniversity: 0 },
          { name: "Hulme Quarter", area: "Hulme", nearUniversity: 1 },
          { name: "Ancoats Mill Studios", area: "Ancoats", nearUniversity: 1 },
          { name: "Fallowfield House", area: "Fallowfield", nearUniversity: 0 },
        ],
      },
      {
        slug: "birmingham",
        name: "Birmingham",
        priceFactor: 0.9,
        universities: [
          { slug: "birmingham-uni", name: "University of Birmingham", lat: 52.4508, lng: -1.9305 },
          { slug: "aston", name: "Aston University", lat: 52.4867, lng: -1.8904 },
        ],
        properties: [
          { name: "Selly Oak Gardens", area: "Selly Oak", nearUniversity: 0 },
          { name: "Aston Works", area: "Aston", nearUniversity: 1 },
          { name: "Digbeth Lofts", area: "Digbeth", nearUniversity: 1 },
          { name: "Edgbaston Place", area: "Edgbaston", nearUniversity: 0 },
        ],
      },
    ],
  },
  {
    slug: "australia",
    name: "Australia",
    currencyCode: "AUD",
    currencySymbol: "A$",
    rentPeriod: "week",
    priceStep: 5,
    prices: { SHARED: [290, 380], ENSUITE: [370, 480], STUDIO: [440, 620], APARTMENT: [640, 880] },
    tenancyWeeks: [26, 52],
    cities: [
      {
        slug: "sydney",
        name: "Sydney",
        priceFactor: 1.1,
        universities: [
          { slug: "usyd", name: "University of Sydney", lat: -33.8886, lng: 151.1873 },
          { slug: "unsw", name: "UNSW Sydney", lat: -33.9173, lng: 151.2313 },
          { slug: "uts", name: "University of Technology Sydney", lat: -33.8832, lng: 151.2005 },
        ],
        properties: [
          { name: "Glebe Point House", area: "Glebe", nearUniversity: 0 },
          { name: "Kensington Park Studios", area: "Kensington", nearUniversity: 1 },
          { name: "Ultimo Central", area: "Ultimo", nearUniversity: 2 },
          { name: "Redfern Lane", area: "Redfern", nearUniversity: 0 },
        ],
      },
      {
        slug: "melbourne",
        name: "Melbourne",
        priceFactor: 1,
        universities: [
          { slug: "unimelb", name: "University of Melbourne", lat: -37.7964, lng: 144.9612 },
          { slug: "rmit", name: "RMIT University", lat: -37.8083, lng: 144.963 },
          { slug: "monash", name: "Monash University (Clayton)", lat: -37.9105, lng: 145.1363 },
        ],
        properties: [
          { name: "Carlton Terrace", area: "Carlton", nearUniversity: 0 },
          { name: "Swanston Central", area: "Melbourne CBD", nearUniversity: 1 },
          { name: "Clayton Commons", area: "Clayton", nearUniversity: 2 },
          { name: "Southbank Residences", area: "Southbank", nearUniversity: 1 },
        ],
      },
    ],
  },
  {
    slug: "canada",
    name: "Canada",
    currencyCode: "CAD",
    currencySymbol: "C$",
    rentPeriod: "month",
    priceStep: 25,
    prices: { SHARED: [1050, 1450], ENSUITE: [1350, 1850], STUDIO: [1750, 2400], APARTMENT: [2500, 3300] },
    tenancyWeeks: [35, 52],
    cities: [
      {
        slug: "toronto",
        name: "Toronto",
        priceFactor: 1.05,
        universities: [
          { slug: "uoft", name: "University of Toronto", lat: 43.6629, lng: -79.3957 },
          { slug: "tmu", name: "Toronto Metropolitan University", lat: 43.6577, lng: -79.3788 },
          { slug: "york", name: "York University", lat: 43.7735, lng: -79.5019 },
        ],
        properties: [
          { name: "Annex Commons", area: "The Annex", nearUniversity: 0 },
          { name: "Gould Street Suites", area: "Downtown Yonge", nearUniversity: 1 },
          { name: "York Village", area: "York University Heights", nearUniversity: 2 },
          { name: "Kensington Market Lofts", area: "Kensington Market", nearUniversity: 0 },
        ],
      },
      {
        slug: "vancouver",
        name: "Vancouver",
        priceFactor: 1.1,
        universities: [
          { slug: "ubc", name: "University of British Columbia", lat: 49.2606, lng: -123.246 },
          { slug: "sfu", name: "Simon Fraser University", lat: 49.2781, lng: -122.9199 },
        ],
        properties: [
          { name: "Point Grey Residences", area: "Point Grey", nearUniversity: 0 },
          { name: "Burnaby Heights House", area: "Burnaby", nearUniversity: 1 },
          { name: "Kitsilano Studios", area: "Kitsilano", nearUniversity: 0 },
          { name: "Lougheed Lofts", area: "Lougheed", nearUniversity: 1 },
        ],
      },
    ],
  },
  {
    slug: "usa",
    name: "United States",
    currencyCode: "USD",
    currencySymbol: "$",
    rentPeriod: "month",
    priceStep: 25,
    prices: { SHARED: [1350, 1850], ENSUITE: [1750, 2450], STUDIO: [2300, 3200], APARTMENT: [3300, 4400] },
    tenancyWeeks: [39, 52],
    cities: [
      {
        slug: "new-york",
        name: "New York",
        priceFactor: 1.25,
        universities: [
          { slug: "nyu", name: "New York University", lat: 40.7295, lng: -73.9965 },
          { slug: "columbia", name: "Columbia University", lat: 40.8075, lng: -73.9626 },
          { slug: "new-school", name: "The New School", lat: 40.7355, lng: -73.9971 },
        ],
        properties: [
          { name: "Washington Square Lofts", area: "Greenwich Village", nearUniversity: 0 },
          { name: "Morningside House", area: "Morningside Heights", nearUniversity: 1 },
          { name: "Union Square Suites", area: "Union Square", nearUniversity: 2 },
          { name: "East Village Commons", area: "East Village", nearUniversity: 0 },
        ],
      },
      {
        slug: "boston",
        name: "Boston",
        priceFactor: 1.1,
        universities: [
          { slug: "bu", name: "Boston University", lat: 42.3505, lng: -71.1054 },
          { slug: "northeastern", name: "Northeastern University", lat: 42.3398, lng: -71.0892 },
          { slug: "mit", name: "Massachusetts Institute of Technology", lat: 42.3601, lng: -71.0942 },
        ],
        properties: [
          { name: "Kenmore Residences", area: "Kenmore", nearUniversity: 0 },
          { name: "Fenway Commons", area: "Fenway", nearUniversity: 1 },
          { name: "Kendall Square Studios", area: "Cambridge", nearUniversity: 2 },
          { name: "Allston Yard", area: "Allston", nearUniversity: 0 },
        ],
      },
    ],
  },
];

const ROOM_NAMES: Record<RoomCategory, string[]> = {
  SHARED: ["Twin Shared Room", "Non-ensuite Room"],
  ENSUITE: ["Classic Ensuite", "Premium Ensuite"],
  STUDIO: ["Studio", "Deluxe Studio"],
  APARTMENT: ["One-bed Apartment"],
};

const ROOM_SIZES: Record<RoomCategory, [number, number]> = {
  SHARED: [11, 14],
  ENSUITE: [12, 17],
  STUDIO: [18, 27],
  APARTMENT: [32, 46],
};

const EXTRA_AMENITIES = (Object.keys(AMENITIES) as AmenityKey[]).filter(
  (key) => !BASIC_AMENITIES.includes(key),
);

const BADGES = ["No Visa, No Pay", "Flexible payments", "Verified property", "Price match", "No deposit"];

const STREETS = ["Station Road", "College Street", "Park Avenue", "Mill Lane", "Market Street", "Victoria Street", "Church Street", "Garden Row"];

const REVIEWERS = ["Aarav S.", "Mei L.", "Tomás R.", "Priya K.", "Oliver B.", "Fatima A.", "Lucas M.", "Chloe W.", "Arjun P.", "Sofia G.", "Daniel O.", "Yuki T.", "Hannah J.", "Omar H.", "Isabella C.", "Kwame N."];

const REVIEW_TEXTS = [
  "Really easy move-in and the staff were friendly from day one. My room was spotless.",
  "Great location — I walk to lectures in minutes. Wi-Fi is fast enough for video calls.",
  "The study rooms are quiet and always available during exams. Would book again.",
  "Kitchen can get busy in the evenings, but the building is clean and feels safe.",
  "Booking was simple and the team answered all my visa questions quickly.",
  "Loved the community events, it helped me make friends in my first week.",
  "A bit pricey but bills are included, so no surprises. Maintenance fixes things fast.",
  "Bright room with loads of storage. The gym is small but has everything I need.",
  "Reception is helpful and parcels are kept safe. Transport links are excellent.",
  "Nice modern building. Laundry is on-site, which saves a lot of time.",
  "I was nervous moving abroad, but the support team made it really smooth.",
  "Comfortable bed, good desk, and a big window. Exactly what I wanted.",
];

function coverFirst(index: number) {
  const cover = INTERIOR_PHOTOS[index % INTERIOR_PHOTOS.length];
  return [cover, ...sample(INTERIOR_PHOTOS.filter((photo) => photo !== cover), 4)];
}

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function offsetCoordinates(lat: number, lng: number, km: number) {
  const bearing = rand() * 2 * Math.PI;
  const dLat = (km * Math.cos(bearing)) / 111;
  const dLng = (km * Math.sin(bearing)) / (111 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lng + dLng };
}

function reviewRating() {
  const r = rand();
  if (r < 0.55) return 5;
  if (r < 0.9) return 4;
  return 3;
}

function buildRoomTypes(country: CountrySeed, city: CitySeed) {
  const categories: RoomCategory[] = ["ENSUITE"];
  if (chance(0.85)) categories.push("STUDIO");
  if (chance(0.5)) categories.unshift("SHARED");
  if (chance(0.35)) categories.push("APARTMENT");

  const rooms = categories.flatMap((category) => {
    const names = ROOM_NAMES[category];
    const variants = names.length > 1 && chance(0.4) ? names : [pick(names)];
    return variants.map((name, i) => {
      const [min, max] = country.prices[category];
      const base = between(min, max) * city.priceFactor * (1 + i * 0.12);
      return {
        name,
        category,
        sizeSqm: Math.round(between(...ROOM_SIZES[category])) + i * 2,
        price: roundTo(base, country.priceStep),
        tenancyWeeks: pick(country.tenancyWeeks),
        available: chance(0.82),
      };
    });
  });

  if (!rooms.some((room) => room.available)) rooms[0].available = true;
  return rooms;
}

async function main() {
  const reset = process.env.SEED_RESET === "1";
  if (!reset && (await prisma.country.count()) > 0) {
    console.log("Demo data already present — skipping seed (set SEED_RESET=1 to re-seed).");
    return;
  }

  await prisma.feedback.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.property.deleteMany();
  await prisma.university.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();

  let propertyCount = 0;

  for (const country of COUNTRIES) {
    const createdCountry = await prisma.country.create({
      data: {
        slug: country.slug,
        name: country.name,
        currencyCode: country.currencyCode,
        currencySymbol: country.currencySymbol,
        rentPeriod: country.rentPeriod,
      },
    });

    for (const city of country.cities) {
      const createdCity = await prisma.city.create({
        data: {
          slug: city.slug,
          name: city.name,
          countryId: createdCountry.id,
          universities: { create: city.universities },
        },
      });

      for (const [index, property] of city.properties.entries()) {
        const university = city.universities[property.nearUniversity];
        const coords = offsetCoordinates(university.lat, university.lng, between(0.4, 2.6));
        const amenities = [...BASIC_AMENITIES, ...sample(EXTRA_AMENITIES, 4 + Math.floor(rand() * 5))];
        const billsIncluded = chance(0.7);
        const propertyType = chance(0.75) ? "Student residence" : "Private apartment";
        const highlights = amenities
          .filter((key) => !BASIC_AMENITIES.includes(key))
          .slice(0, 3)
          .map((key) => AMENITIES[key].label.toLowerCase());

        const reviews = Array.from({ length: 3 + Math.floor(rand() * 3) }, () => ({
          authorName: pick(REVIEWERS),
          universityName: pick(city.universities).name,
          rating: reviewRating(),
          text: pick(REVIEW_TEXTS),
        }));
        const rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await prisma.property.create({
          data: {
            slug: `${city.slug}-${property.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            name: property.name,
            area: property.area,
            address: `${Math.floor(between(2, 180))} ${pick(STREETS)}, ${property.area}, ${city.name}`,
            lat: coords.lat,
            lng: coords.lng,
            description:
              `${property.name} is a ${propertyType.toLowerCase()} in ${property.area}, ${city.name}. ` +
              `Every room comes fully furnished${billsIncluded ? " with all bills included" : ""}, ` +
              `and residents can use the ${highlights.join(", ")}. ` +
              `There's on-site support, secure key-card entry and a friendly community of students from around the world.`,
            propertyType,
            rating: Math.round(rating * 10) / 10,
            reviewCount: reviews.length,
            // Rotate the cover photo so neighbouring listings don't share one.
            images: coverFirst(propertyCount),
            amenities,
            badges: sample(BADGES, 2 + Math.floor(rand() * 2)),
            billsIncluded,
            featured: index === 0,
            cityId: createdCity.id,
            roomTypes: { create: buildRoomTypes(country, city) },
            reviews: { create: reviews },
          },
        });
        propertyCount++;
      }
    }
  }

  console.log(`Seeded ${COUNTRIES.length} countries and ${propertyCount} properties.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
