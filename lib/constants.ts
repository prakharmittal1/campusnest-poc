// Client-safe constants shared by server queries and client components.

export const ROOM_CATEGORIES = [
  { value: "SHARED", label: "Shared room" },
  { value: "ENSUITE", label: "Ensuite" },
  { value: "STUDIO", label: "Studio" },
  { value: "APARTMENT", label: "Apartment" },
] as const;

export type RoomCategory = (typeof ROOM_CATEGORIES)[number]["value"];

export function roomCategoryLabel(value: string): string {
  return ROOM_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export const SORT_OPTIONS = [
  { value: "relevance", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "distance", label: "Distance to university" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export type SearchResult = {
  type: "country" | "city" | "university" | "property";
  label: string;
  sublabel: string;
  href: string;
};
