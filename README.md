# CampusNest — student accommodation POC

A lightweight student housing marketplace for testing the market. Students search by city,
university or property, filter listings, view a property and send an enquiry to a housing expert.

> "CampusNest" is a placeholder name. All properties, addresses, prices, photos and reviews are
> demo data. University names and locations are real so that distances look realistic.

## What's included

| Page | URL | Features |
| --- | --- | --- |
| Home | `/` | Search with autocomplete, city directory, top-rated homes, how it works, FAQ, "free shortlist" enquiry popup |
| Country | `/uk` | Cities with counts and links to each university |
| City listing | `/uk/london` | Filters (university, price, room type, bills, amenities), sorting (recommended, price, distance), mobile filter drawer |
| Property | `/uk/london/london-camden-yard` | Photo gallery, rooms and prices, amenities, map with nearby universities, reviews, policies, FAQ, enquiry form |
| Every page | — | "Feedback" tab on the right edge: *Would you use this?* (yes / maybe / no), comments, optional email |

Markets: UK (£/week), Australia (A$/week), Canada (C$/month), USA ($/month). That's 9 cities,
25 universities and 37 properties. Filters live in the URL, so filtered links can be shared, e.g.
`/uk/london?university=ucl&room=STUDIO&maxPrice=400&sort=price_asc`.

## Design system

A "wayfinding" identity: white paper, navy ink, and one sunshine-yellow accent, with hairline borders.

| Where | What |
| --- | --- |
| `app/globals.css` | **All design tokens**: colours (`canvas`, `surface`, `line`, `ink`, `muted`, `accent`…), radii, and the `heading-xl/lg/md` and `highlight` utilities. Default Tailwind colours are disabled, so every colour comes from here. |
| `components/ui/` | Shared building blocks: `Button`/`ButtonLink`/`buttonClass` (primary, accent, outline, ghost), `Container`, `SectionHeading`, `Tag`, `DistanceTag` |
| `components/brand/` | `Logo` / `LogoMark` (map pin with a roof) and the hero `RouteIllustration` (inline SVG) |
| `app/icon.svg`, `app/apple-icon.tsx`, `app/opengraph-image.tsx` | Favicon, iOS icon and social share image, all generated from the same logo geometry |
| `lib/site.ts` | Brand name, tagline, promises and contact details |
| `content/` | Marketing and policy copy, kept out of components so messaging can change quickly |

Rules of thumb: yellow is reserved for the one key action per view (search, send enquiry) and the
brand mark. Use `className` on buttons for layout only (margins, width), not to override variant or size.

## Performance notes

- One variable font (Manrope), no hero or city photography (the hero art is inline SVG).
- Homepage: 4 images, 1 font file, ~12 KB gzipped HTML. JavaScript is ~184 KB gzipped, almost all of
  it the Next.js/React runtime; app code is ~15 KB (search box and enquiry popup).
- The enquiry form in the popup and the Leaflet map are only downloaded when they're needed
  (popup opened, map scrolled near the viewport).
- Header, footer and home share one cached country query per request.

## Tech

- Next.js 16 (App Router, server components, server actions) + TypeScript
- Tailwind CSS 4
- Prisma 7 with PostgreSQL (Neon in production) through the `pg` driver adapter
- Leaflet with OpenStreetMap tiles (greyed out via CSS)
- Zod for validating the enquiry form
- Vercel Web Analytics for page views and visitors (`<Analytics />` in `app/layout.tsx`)

## Getting started (local)

Requires Node.js 20.9 or later. No Docker needed — Prisma runs a local Postgres for development.

```bash
npm install            # also generates the Prisma client
cp .env.example .env   # local database URLs (defaults match the Prisma dev server)
npx prisma dev --name campusnest --detach   # start local Postgres (check URLs with `npx prisma dev ls`)
npm run db:setup       # apply migrations and load demo data
npm run dev            # http://localhost:3000
```

## Deploying (Vercel + Neon)

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com/new), **Import** the repository and click **Deploy**.
   The first build is expected to fail with `DATABASE_URL is not set` — there's no database yet.
3. In the project, open **Storage → Create Database → Neon** (free plan), and connect it to the
   project for **all environments**. This adds `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically.
4. **Deployments → ⋯ → Redeploy.** The build (`npm run vercel-build`) applies migrations, loads the demo
   data on the first run only, and builds the site.

Every push to `main` redeploys production; other branches get preview URLs.

### Analytics

Page views and visitors appear in Vercel under the project's **Analytics** tab (enable it there once).
Nothing is sent from local development.

### Reading feedback and enquiries

In Vercel, open **Storage → your Neon database → Open in Neon Console → Tables**, then the `Feedback`
and `Enquiry` tables. (Or run `npm run db:studio` locally with `DATABASE_URL` pointed at the Neon database.)

Re-deploying never deletes data. To wipe and re-seed the demo listings, run the seed with `SEED_RESET=1`
against the database — this also deletes enquiries and feedback.

## Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create and apply a migration after changing `prisma/schema.prisma` |
| `npm run db:setup` | Apply migrations and load demo data (skips if data already exists) |
| `npm run db:studio` | Open Prisma Studio to browse data, including **enquiries** and **feedback** |
| `npm run db:reset` | Wipe the local database, re-run migrations and re-seed (**deletes enquiries and feedback**) |
| `npm run vercel-build` | What Vercel runs: env check → migrations → seed (first run only) → build |

## Project layout

```
app/
  page.tsx                          home
  [country]/page.tsx                country → cities
  [country]/[city]/page.tsx         listing with filters and sorting
  [country]/[city]/[property]/      property detail
  api/search/route.ts               autocomplete endpoint
  actions/enquiry.ts, feedback.ts   server actions that validate and save enquiries / feedback
  icon.svg, apple-icon.tsx, opengraph-image.tsx
components/
  ui/                               design-system primitives
  brand/                            logo and illustration
  enquiry/, feedback/, listing/, property/, layout/
content/                            editable copy (home, property policies and FAQs)
lib/
  site.ts                           brand config
  queries.ts                        all database reads
  filters.ts                        URL params → validated listing filters
  format.ts, geo.ts                 prices, tenancies, distances
  amenities.ts, constants.ts        shared lists (amenities, room types, sort options)
prisma/
  schema.prisma, seed.ts, migrations/
scripts/check-database-env.mjs      clear build error when no database is connected
```

## Before going live

- **Map tiles:** OpenStreetMap's public tile servers are not meant for production traffic. Switch to
  a hosted provider (e.g. MapTiler, Stadia Maps) by changing the `TileLayer` URL in
  `components/property/LeafletMap.tsx`.
- **Contact details** in `lib/site.ts` are placeholders. Share images use the Vercel production URL; set
  `NEXT_PUBLIC_SITE_URL` if you add a custom domain.
- **Vercel Hobby** (free) is intended for non-commercial use; move to Pro if the POC becomes a business.

## Next steps toward a real product

- Analytics on search → property view → enquiry, to measure demand per city during the market test
- Admin area to manage properties and view or assign enquiries (plus login)
- Email or WhatsApp notification when an enquiry arrives
- Move-in date and tenancy-length filters, map view on the listing page
- Real photos and property data, uploaded through a landlord or partner portal
- Online reservation with a deposit (e.g. Stripe) once availability data is reliable
