import { ROOM_CATEGORIES, SORT_OPTIONS, type SortOption } from "./constants";
import { isAmenityKey } from "./amenities";

export type ListingFilters = {
  minPrice?: number;
  maxPrice?: number;
  rooms: string[];
  amenities: string[];
  bills: boolean;
  university?: string;
  sort: SortOption;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

const toArray = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

function toPrice(value: string | string[] | undefined): number | undefined {
  const n = Number.parseInt(toArray(value)[0] ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

const ROOM_VALUES = new Set<string>(ROOM_CATEGORIES.map((c) => c.value));
const SORT_VALUES = new Set<string>(SORT_OPTIONS.map((o) => o.value));

/** Turns listing URL params (?room=STUDIO&amenity=gym&university=ucl…) into validated filters. */
export function parseListingFilters(params: RawSearchParams): ListingFilters {
  const university = toArray(params.university)[0] || undefined;
  const requestedSort = toArray(params.sort)[0];
  let sort: SortOption = university ? "distance" : "relevance";
  if (requestedSort && SORT_VALUES.has(requestedSort)) sort = requestedSort as SortOption;
  if (sort === "distance" && !university) sort = "relevance";

  return {
    minPrice: toPrice(params.minPrice),
    maxPrice: toPrice(params.maxPrice),
    rooms: toArray(params.room).filter((r) => ROOM_VALUES.has(r)),
    amenities: toArray(params.amenity).filter(isAmenityKey),
    bills: toArray(params.bills)[0] === "1",
    university,
    sort,
  };
}

/** Number of applied filters (a price range counts once); sort order is not a filter. */
export function countActiveFilters(filters: ListingFilters): number {
  return (
    filters.rooms.length +
    filters.amenities.length +
    Number(filters.bills) +
    Number(filters.university !== undefined) +
    Number(filters.minPrice !== undefined || filters.maxPrice !== undefined)
  );
}
