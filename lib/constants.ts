// Client-safe constants shared by server queries and client components.
// Display labels live in messages/*.json ("roomCategories", "sort", "badges", "propertyTypes").

export const ROOM_CATEGORIES = ["SHARED", "ENSUITE", "STUDIO", "APARTMENT"] as const;

export type RoomCategory = (typeof ROOM_CATEGORIES)[number];

export function isRoomCategory(value: string): value is RoomCategory {
  return (ROOM_CATEGORIES as readonly string[]).includes(value);
}

export const SORT_OPTIONS = ["relevance", "price_asc", "price_desc", "distance"] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

/** Badge labels as stored in the database → message keys. Unknown badges are shown as stored. */
export const BADGE_KEYS = {
  "No Visa, No Pay": "noVisaNoPay",
  "Flexible payments": "flexiblePayments",
  "Verified property": "verifiedProperty",
  "Price match": "priceMatch",
  "No deposit": "noDeposit",
} as const;

export function badgeKey(badge: string) {
  return BADGE_KEYS[badge as keyof typeof BADGE_KEYS];
}

/** Property types as stored in the database → message keys. */
export const PROPERTY_TYPE_KEYS = {
  "Student residence": "studentResidence",
  "Private apartment": "privateApartment",
} as const;

export function propertyTypeKey(type: string) {
  return PROPERTY_TYPE_KEYS[type as keyof typeof PROPERTY_TYPE_KEYS];
}

export type SearchResult = {
  type: "country" | "city" | "university" | "property";
  label: string;
  sublabel: string;
  href: string;
};
