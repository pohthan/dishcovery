# Dishcovery

A mobile-first web app that helps working adults with kidney disease, diabetes or hypertension find nearby places to eat, and the specific dishes that fit their limits. First launch area: Singapore CBD and SMU.

Hack-day demo. Not medical advice. Food allergies are out of scope.

## Layout

| Path | What it is |
|---|---|
| `src/shared` | Types and Zod schemas shared by API and UI (nutrients, venues, profile, match results) |
| `src/backend` | Express API. `app/services/matching` is the pure matching engine (the safety rules live here) |
| `src/frontend` | Vite, React, TypeScript, Tailwind, shadcn/ui, Leaflet |
| `docs/` | Requirements decisions, clinical rules, data spike findings |
| `data/venues`, `data/published`, `data/upload`, `data/coupons` | Venue locations, MUIS halal list, the upload sheet `upload/dishes.csv` (dishes and nutrients, you fill it in; see docs/06), and the demo coupons |
| `data/spike` | Earlier research on estimating nutrients (USDA FoodData Central). Not used by the app. `data/raw` is gitignored |

## Run it

```bash
npm install
```

Without a database (serves the files under `data/` from memory, dev only):

```bash
npm run dev:local -w src/backend
npm run dev -w src/frontend
```

With MongoDB (copy `src/backend/.env.example` to `.env` and fill it in first):

```bash
npm run seed -w src/backend
npm run dev -w src/backend
npm run dev -w src/frontend
```

Checks:

```bash
npm test
npm run typecheck
```

## Deploy

Step-by-step guide to GitHub and Vercel: [docs/07-deploy-vercel.md](docs/07-deploy-vercel.md). In short: `npm run build:vercel` builds the site and one API function with the data files; `npm run smoke:vercel` checks it; push to GitHub and import the repository in Vercel. No database is used on Vercel.

## Coupons demo

Open `http://localhost:5173/#/coupons-demo` (or use the "Coupons demo" button on the results page). It shows five made-up coupons on real venues, with a show-at-the-counter screen (code and QR) and a local "mark as used". Everything is labelled DEMO.

- The coupons live in `data/coupons/demo-coupons.json`, apart from the real catalog, and never appear in match results.
- `npm run dev:local` turns the demo on. With MongoDB, set `DEMO_COUPONS=true` in `src/backend/.env`; it is off by default.
- Marking a coupon used only changes this browser. A real coupon would need the venue to check and spend it.

## Rules the code enforces

- Never says a dish is "safe". Wording is in `src/frontend/src/utils/copy.ts`.
- Only sodium has a preset. Potassium, phosphorus, carbohydrate and sugar limits apply only when the user enters them.
- A dish with a missing value for a limited nutrient is excluded, never guessed.
- When few dishes fit, the app also shows the closest ones and exactly how far over each is. A dish is only "close" if it has data for every checked nutrient, passes the halal and vegetarian filters, and is at most 50% over its worst limit. Dishes with missing data are counted as "cannot be checked yet", never as close.
- Coupons appear only on dishes that already fit and never change ranking.
- The profile lives in the browser and is sent per request without being stored.
- There is no demo data. Nutrition comes only from `data/upload/dishes.csv` (HPB values or numbers the restaurant published); a dish without them has no nutrients and is excluded for users with limits.
- Dishes from third-party listings are labelled "Unverified menu".
