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
