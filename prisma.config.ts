import "dotenv/config";
import { defineConfig } from "prisma/config";

// The CLI (migrations) needs a direct connection; the app itself uses the pooled DATABASE_URL.
// Neon's Vercel integration provides DATABASE_URL_UNPOOLED; plain setups can use DATABASE_URL for both.
const directUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: directUrl,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
