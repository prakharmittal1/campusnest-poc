// Labels live in messages/*.json under "amenities" and "amenityGroups".
export type AmenityGroup = "room" | "building" | "safety";

export const AMENITIES = {
  wifi: { group: "room" },
  furnished: { group: "room" },
  desk: { group: "room" },
  ac: { group: "room" },
  tv: { group: "room" },
  gym: { group: "building" },
  cinema: { group: "building" },
  study_room: { group: "building" },
  laundry: { group: "building" },
  bike_storage: { group: "building" },
  common_room: { group: "building" },
  rooftop: { group: "building" },
  games_room: { group: "building" },
  cafe: { group: "building" },
  parking: { group: "building" },
  cctv: { group: "safety" },
  onsite_staff: { group: "safety" },
  keycard: { group: "safety" },
} as const satisfies Record<string, { group: AmenityGroup }>;

export type AmenityKey = keyof typeof AMENITIES;

export const AMENITY_GROUPS: AmenityGroup[] = ["room", "building", "safety"];

/** Every property has these, so cards don't bother showing them. */
export const BASIC_AMENITIES: AmenityKey[] = ["wifi", "furnished", "desk", "cctv", "keycard"];

/** Amenities worth offering as listing filters (the always-present basics are left out). */
export const FILTERABLE_AMENITIES: AmenityKey[] = [
  "gym",
  "laundry",
  "study_room",
  "cinema",
  "ac",
  "bike_storage",
  "parking",
];

export function isAmenityKey(key: string): key is AmenityKey {
  return key in AMENITIES;
}
