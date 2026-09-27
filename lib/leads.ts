// Database reads for the admin area and the Excel export of leads.
import { prisma } from "./prisma";
import type { JourneyEventType } from "./tracking";

export type DateRange = { from?: Date; to?: Date };

const createdIn = ({ from, to }: DateRange) =>
  from || to ? { createdAt: { ...(from && { gte: from }), ...(to && { lt: to }) } } : {};

export async function getLeadStats() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [accounts, consented, enquiries, newAccounts, events] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { consentToShare: true } }),
    prisma.enquiry.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.journeyEvent.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);
  return { accounts, consented, enquiries, newAccounts, events };
}

type EventRow = { type: string; data: unknown; createdAt: Date };

/** Per-user journey summary: how far each student has got. */
function summarise(events: EventRow[]) {
  const count = (type: JourneyEventType) => events.filter((e) => e.type === type).length;
  const field = (e: EventRow, key: string) => {
    const value = (e.data as Record<string, unknown> | null)?.[key];
    return typeof value === "string" ? value : undefined;
  };
  const cityCounts = new Map<string, number>();
  for (const e of events) {
    const city = e.type === "view_city" || e.type === "view_property" ? field(e, "city") : undefined;
    if (city) cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
  }
  const topCity = [...cityCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const viewed = new Set(events.filter((e) => e.type === "view_property").map((e) => field(e, "property")));
  const lastActive = events.reduce<Date | null>((max, e) => (!max || e.createdAt > max ? e.createdAt : max), null);
  return {
    searches: count("search"),
    citiesViewed: count("view_city"),
    propertiesViewed: viewed.size,
    roomsSelected: count("select_room"),
    enquiriesSent: count("enquiry_sent"),
    topCity,
    lastActive,
  };
}

/** One row per account with profile, attribution and journey summary. */
export async function getLeads(range: DateRange = {}, limit?: number) {
  const users = await prisma.user.findMany({
    where: createdIn(range),
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      events: { select: { type: true, data: true, createdAt: true } },
      accounts: { select: { providerId: true } },
      _count: { select: { enquiries: true } },
    },
  });
  return users.map(({ events, accounts, _count, ...user }) => ({
    ...user,
    // Email-link sign-ins don't create an Account row; Google ones do.
    signInMethods: ["email link", ...new Set(accounts.map((a) => a.providerId))]
      .filter((method, i) => i > 0 || accounts.length === 0)
      .join(", "),
    enquiries: _count.enquiries,
    journey: summarise(events),
  }));
}

export async function getJourneyEvents(range: DateRange = {}) {
  return prisma.journeyEvent.findMany({
    where: createdIn(range),
    orderBy: { createdAt: "asc" },
    include: { user: { select: { email: true, name: true } } },
  });
}

export async function getEnquiries(range: DateRange = {}) {
  return prisma.enquiry.findMany({
    where: createdIn(range),
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { name: true, city: { select: { name: true } } } },
      user: { select: { email: true } },
    },
  });
}
