"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";
import { pathFromUrl, recordEvent } from "@/lib/journey";
import { getSession } from "@/lib/session";
import { ANON_COOKIE, CLIENT_EVENT_TYPES, TRACKING_COOKIE_OPTIONS, type ClientEventType } from "@/lib/tracking";

const detailsSchema = z
  .record(
    z.string().max(40),
    z.union([z.string().max(300), z.number(), z.boolean(), z.null(), z.array(z.string().max(100)).max(20)]),
  )
  .refine((data) => Object.keys(data).length <= 15);

export type TrackDetails = z.infer<typeof detailsSchema>;

/** Records a journey step reported by the browser (searches, page views, room picks). Fire and forget. */
export async function track(type: ClientEventType, details?: TrackDetails): Promise<void> {
  if (!CLIENT_EVENT_TYPES.includes(type)) return;
  const parsed = detailsSchema.optional().safeParse(details);
  if (!parsed.success) return;

  const [cookieStore, headerList, session] = await Promise.all([cookies(), headers(), getSession().catch(() => null)]);
  let anonymousId = cookieStore.get(ANON_COOKIE)?.value;
  if (!anonymousId) {
    // proxy.ts normally sets this on the first page load; this covers blocked or expired cookies.
    anonymousId = crypto.randomUUID();
    cookieStore.set(ANON_COOKIE, anonymousId, TRACKING_COOKIE_OPTIONS);
  }

  await recordEvent({
    type,
    anonymousId,
    userId: session?.user.id,
    // The action is posted from the page the student is on.
    path: pathFromUrl(headerList.get("referer")),
    data: parsed.data,
  });
}
