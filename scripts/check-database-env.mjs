// Fails the Vercel build early with a clear message if no database is connected yet.
if (!process.env.DATABASE_URL) {
  console.error(
    "\n✖ DATABASE_URL is not set.\n" +
      "  In Vercel: open the project → Storage → Create Database → Neon, connect it to this project\n" +
      "  (all environments), then redeploy.\n",
  );
  process.exit(1);
}
