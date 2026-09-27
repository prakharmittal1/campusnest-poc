import { NextResponse, type NextRequest } from "next/server";
import { ANON_COOKIE, ATTRIBUTION_COOKIE, TRACKING_COOKIE_OPTIONS } from "@/lib/tracking";

/**
 * Gives every visitor an anonymous id (for the journey before sign-up) and remembers how they first
 * arrived (UTM tags or an external referrer), so both can be attached to their account later.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.has(ANON_COOKIE)) {
    response.cookies.set(ANON_COOKIE, crypto.randomUUID(), TRACKING_COOKIE_OPTIONS);
  }

  if (!request.cookies.has(ATTRIBUTION_COOKIE)) {
    const params = request.nextUrl.searchParams;
    const attribution = {
      utmSource: params.get("utm_source")?.slice(0, 100),
      utmMedium: params.get("utm_medium")?.slice(0, 100),
      utmCampaign: params.get("utm_campaign")?.slice(0, 100),
      referrer: externalReferrer(request),
    };
    if (Object.values(attribution).some(Boolean)) {
      response.cookies.set(ATTRIBUTION_COOKIE, JSON.stringify(attribution), TRACKING_COOKIE_OPTIONS);
    }
  }

  return response;
}

function externalReferrer(request: NextRequest): string | undefined {
  const referrer = request.headers.get("referer");
  if (!referrer) return undefined;
  try {
    const url = new URL(referrer);
    return url.host === request.nextUrl.host ? undefined : `${url.origin}${url.pathname}`.slice(0, 200);
  } catch {
    return undefined;
  }
}

export const config = {
  // Pages only: skip API routes, Next.js assets, and files with an extension (icons, images).
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
