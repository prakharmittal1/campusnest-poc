import { notFound } from "next/navigation";
import { getSession, isAdminEmail } from "./session";

/** Only team members listed in ADMIN_EMAILS get in; everyone else sees a 404. */
export async function requireAdmin() {
  const session = await getSession().catch(() => null);
  if (!session || !isAdminEmail(session.user.email)) notFound();
  return session.user;
}
