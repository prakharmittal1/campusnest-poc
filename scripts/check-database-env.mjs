// Fails the Vercel build early with a clear message if no database is connected yet.
if (!process.env.DATABASE_URL) {
  console.error(
    "\n✖ DATABASE_URL is not set.\n" +
      "  In Vercel: open the project → Storage → Create Database → Neon, connect it to this project\n" +
      "  (all environments), then redeploy.\n",
  );
  process.exit(1);
}

// Fails without an auth secret (sessions can't be signed); warns about optional sign-in settings.
if (!process.env.BETTER_AUTH_SECRET) {
  console.error(
    "\n✖ BETTER_AUTH_SECRET is not set.\n" +
      "  Generate one with `openssl rand -base64 32` and add it in Vercel → Settings → Environment Variables.\n",
  );
  process.exit(1);
}
const optional = {
  RESEND_API_KEY: "email sign-in links can't be sent",
  GOOGLE_CLIENT_ID: "the Google sign-in button is hidden",
  ADMIN_EMAILS: "nobody can open /admin or download leads",
};
for (const [name, effect] of Object.entries(optional)) {
  if (!process.env[name]) console.warn(`⚠ ${name} is not set — ${effect}.`);
}
