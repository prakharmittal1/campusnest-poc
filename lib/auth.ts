import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { sendMagicLinkEmail } from "./email";
import { LOCALE_COOKIE, resolveLocale } from "./i18n";
import { anonymousIdFromHeader, attachAnonymousJourney, cookieFromHeader, recordEvent } from "./journey";
import { prisma } from "./prisma";
import { siteUrl } from "./site-url";
import { ATTRIBUTION_COOKIE, parseAttribution } from "./tracking";

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

type HookContext = { headers?: Headers; request?: Request } | null | undefined;
const cookieHeader = (ctx: HookContext) => ctx?.headers?.get("cookie") ?? ctx?.request?.headers.get("cookie");
const pathOf = (ctx: HookContext) => (ctx?.request ? new URL(ctx.request.url).pathname : "/api/auth");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? siteUrl,
  // Preview deployments get their own URLs; let them sign in too.
  trustedOrigins: [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .filter(Boolean)
    .map((host) => `https://${host}`),
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    // Avoids a database read for the session on every page view.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // Someone who first signed in by email can later use Google with the same address, and vice versa.
  account: { accountLinking: { enabled: true, trustedProviders: ["google"] } },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          prompt: "select_account",
        },
      }
    : {},
  plugins: [
    magicLink({
      expiresIn: 15 * 60,
      sendMagicLink: async ({ email, url }, ctx) => {
        const locale = resolveLocale(
          cookieFromHeader(cookieHeader(ctx), LOCALE_COOKIE),
          ctx?.headers?.get("accept-language") ?? null,
        );
        await sendMagicLinkEmail(email, url, locale);
      },
    }),
    // Lets server actions set auth cookies. Must stay last.
    nextCookies(),
  ],
  databaseHooks: {
    user: {
      create: {
        // New account: remember the UI language and where the student came from, and log the sign-up.
        after: async (user, ctx) => {
          const cookies = cookieHeader(ctx);
          const anonymousId = anonymousIdFromHeader(cookies);
          const locale = resolveLocale(cookieFromHeader(cookies, LOCALE_COOKIE), ctx?.headers?.get("accept-language") ?? null);
          const attribution = parseAttribution(cookieFromHeader(cookies, ATTRIBUTION_COOKIE));
          try {
            await prisma.user.update({ where: { id: user.id }, data: { locale, ...attribution } });
          } catch (error) {
            console.error("Failed to save sign-up details", error);
          }
          if (anonymousId) await recordEvent({ type: "signup", anonymousId, userId: user.id, path: pathOf(ctx) });
        },
      },
    },
    session: {
      create: {
        // Every sign-in: attach what this browser did while signed out, and log returning sign-ins.
        after: async (session, ctx) => {
          const anonymousId = anonymousIdFromHeader(cookieHeader(ctx));
          await attachAnonymousJourney(session.userId, anonymousId);
          const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { createdAt: true } });
          const isNewUser = user && Date.now() - user.createdAt.getTime() < 60_000;
          if (anonymousId && !isNewUser) {
            await recordEvent({ type: "login", anonymousId, userId: session.userId, path: pathOf(ctx) });
          }
        },
      },
    },
  },
});

export const authProviders = { google: googleEnabled };
