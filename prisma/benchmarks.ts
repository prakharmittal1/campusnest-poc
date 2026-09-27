// Real, published rent figures used as a market reality check next to the demo listings.
// Every entry cites an official university or government source; nothing here is scraped
// from competitor sites. Prices are "as published" — re-check the URLs each academic year.

export type Benchmark = {
  citySlug: string;
  /** Lowest published price in the city's currency and period. */
  lowPrice: number;
  /** Highest published price, or null when the source only publishes a "from" price. */
  highPrice: number | null;
  period: "week" | "month";
  sourceName: string;
  sourceUrl: string;
  /** What the figure covers, including any conversion we applied. */
  note: string;
  asOf: string;
};

export const BENCHMARKS: Benchmark[] = [
  {
    citySlug: "london",
    lowPrice: 154,
    highPrice: 456,
    period: "week",
    sourceName: "UCL accommodation fees",
    sourceUrl: "https://www.ucl.ac.uk/study/accommodation/fees-guidance-and-payment/fees-2026-27",
    note: "UCL halls of residence, bills included. Affordable (London Plan) rooms are about £200/week.",
    asOf: "2026/27",
  },
  {
    citySlug: "manchester",
    lowPrice: 115,
    highPrice: 288,
    period: "week",
    sourceName: "University of Manchester cost of living",
    sourceUrl: "https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/",
    note: "University self-catered halls, £4,853–£12,096 a year converted over a 42-week contract.",
    asOf: "2025/26",
  },
  {
    citySlug: "birmingham",
    lowPrice: 107,
    highPrice: 321,
    period: "week",
    sourceName: "University of Birmingham accommodation fees",
    sourceUrl: "https://www.birmingham.ac.uk/study/accommodation/our-accommodation/accommodation-fees",
    note: "Shared bathroom (£107) up to studio apartment (£321). Wi-Fi, insurance and utility bills included.",
    asOf: "2026/27",
  },
  {
    citySlug: "sydney",
    lowPrice: 312,
    highPrice: 588,
    period: "week",
    sourceName: "University of Sydney student accommodation",
    sourceUrl: "https://www.sydney.edu.au/study/accommodation.html",
    note: "University residences: Queen Mary Building rooms from A$312, Kensington from A$588. Bills included.",
    asOf: "2026",
  },
  {
    citySlug: "melbourne",
    lowPrice: 502,
    highPrice: null,
    period: "week",
    sourceName: "University of Melbourne accommodation",
    sourceUrl: "https://study.unimelb.edu.au/accommodation",
    note: "University Accommodation, Parkville — from A$502/week per person (Little Hall), utilities included.",
    asOf: "2026",
  },
  {
    citySlug: "toronto",
    lowPrice: 958,
    highPrice: 2188,
    period: "month",
    sourceName: "University of Toronto residence fees",
    sourceUrl: "https://www.studentlife.utoronto.ca/task/compare-u-of-t-residence-fees/",
    note: "St George residences without a mandatory meal plan; September–April fees converted to a monthly figure.",
    asOf: "2026/27",
  },
  {
    citySlug: "vancouver",
    lowPrice: 970,
    highPrice: 1645,
    period: "month",
    sourceName: "UBC Student Housing fees",
    sourceUrl: "https://vancouver.housing.ubc.ca/applications/fees-payments/",
    note: "UBC Vancouver year-round residence (Green College), single studio to large studio. Internet and utilities included.",
    asOf: "2026/27",
  },
  {
    citySlug: "new-york",
    lowPrice: 1222,
    highPrice: 2038,
    period: "month",
    sourceName: "NYU housing rates",
    sourceUrl:
      "https://www.nyu.edu/students/student-information-and-resources/housing-and-dining/on-campus-living/application-and-assignments/rates-and-payments.html",
    note: "Manhattan residence halls, triple to double rooms; per-semester rates converted over about 4.5 months.",
    asOf: "2026/27",
  },
  {
    citySlug: "boston",
    lowPrice: 1463,
    highPrice: 2606,
    period: "month",
    sourceName: "Boston University residence rates",
    sourceUrl: "https://www.bu.edu/housing/living/rates/2026-27-academic-year-rates/",
    note: "Shared room to single apartment, $13,170–$23,450 an academic year converted over about 9 months. Dining plan extra.",
    asOf: "2026/27",
  },
];
