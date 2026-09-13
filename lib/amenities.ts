export type AmenityGroup = "In your room" | "Building & community" | "Safety & security";

export const AMENITIES = {
  wifi: { label: "High-speed Wi-Fi", group: "In your room" },
  furnished: { label: "Fully furnished", group: "In your room" },
  desk: { label: "Study desk", group: "In your room" },
  ac: { label: "Air conditioning", group: "In your room" },
  tv: { label: "Smart TV", group: "In your room" },
  gym: { label: "Gym", group: "Building & community" },
  cinema: { label: "Cinema room", group: "Building & community" },
  study_room: { label: "Study rooms", group: "Building & community" },
  laundry: { label: "Laundry", group: "Building & community" },
  bike_storage: { label: "Bike storage", group: "Building & community" },
  common_room: { label: "Common room", group: "Building & community" },
  rooftop: { label: "Rooftop terrace", group: "Building & community" },
  games_room: { label: "Games room", group: "Building & community" },
  cafe: { label: "On-site café", group: "Building & community" },
  parking: { label: "Parking", group: "Building & community" },
  cctv: { label: "24/7 CCTV", group: "Safety & security" },
  onsite_staff: { label: "On-site staff", group: "Safety & security" },
  keycard: { label: "Key-card entry", group: "Safety & security" },
} as const satisfies Record<string, { label: string; group: AmenityGroup }>;

export type AmenityKey = keyof typeof AMENITIES;

export const AMENITY_GROUPS: AmenityGroup[] = [
  "In your room",
  "Building & community",
  "Safety & security",
];

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
