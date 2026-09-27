// Server-side recording of the student journey (see JourneyEvent in prisma/schema.prisma).
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { ANON_COOKIE, type JourneyEventType } from "./tracking";

type EventInput = {
  type: JourneyEventType;
  anonymousId: string;
  userId?: string | null;
  path: string;
  data?: Prisma.InputJsonObject;
};

/** Records one journey step. Never throws: tracking must not break the page or action it's part of. */
export async function recordEvent({ type, anonymousId, userId, path, data }: EventInput) {
  try {
    await prisma.journeyEvent.create({
      data: { type, anonymousId, userId: userId ?? null, path: path.slice(0, 500), data },
    });
  } catch (error) {
    console.error("Failed to record journey event", type, error);
  }
}

/** Attaches everything this browser did while signed out to the account. */
export async function attachAnonymousJourney(userId: string, anonymousId: string | undefined) {
  if (!anonymousId) return;
  try {
    await prisma.journeyEvent.updateMany({ where: { anonymousId, userId: null }, data: { userId } });
  } catch (error) {
    console.error("Failed to attach anonymous journey", error);
  }
}

/** Reads one cookie from a raw Cookie header (for contexts without next/headers, e.g. auth hooks). */
export function cookieFromHeader(header: string | null | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      try {
        return decodeURIComponent(rest.join("="));
      } catch {
        return rest.join("=");
      }
    }
  }
  return undefined;
}

export function anonymousIdFromHeader(cookieHeader: string | null | undefined) {
  return cookieFromHeader(cookieHeader, ANON_COOKIE);
}

/** Path + query of a same-site URL (e.g. the Referer of a server action), or "/" if unusable. */
export function pathFromUrl(url: string | null | undefined): string {
  if (!url) return "/";
  try {
    const { pathname, search } = new URL(url);
    return `${pathname}${search}`;
  } catch {
    return "/";
  }
}
