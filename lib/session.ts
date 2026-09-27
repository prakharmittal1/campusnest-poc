import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";
import { prisma } from "./prisma";

/** The signed-in session for this request, or null. Cached so the header and page share one lookup. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Team members allowed into /admin, from the ADMIN_EMAILS env var (comma-separated). */
export function isAdminEmail(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase());
}

export type Viewer = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  isAdmin: boolean;
};

/** What the UI needs about the signed-in student (header menu, pre-filled forms), or null. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await getSession().catch(() => null);
  if (!session) return null;
  // Read from the database: the session's copy of the user is cached for a few minutes, so it
  // would miss a name just saved on the profile form.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, phone: true },
  });
  if (!user) return null;
  return { id: session.user.id, ...user, isAdmin: isAdminEmail(user.email) };
});
