/** Explicit dev-only entrypoint: serves the catalog files from memory, no database. Use `npm run dev:local`. */
import { createApp } from "../app/app";
import { staticCatalogRepository } from "../app/repositories/static.catalog.repository";
import { listCoupons } from "../app/services/coupons/listing";
import { repoDataRoot } from "./data-root";
import { loadDemoCoupons } from "./demo-coupons";
import { loadCatalogData } from "./load-catalog";

const catalog = await loadCatalogData(repoDataRoot);
const demoCoupons = await loadDemoCoupons(repoDataRoot);
// Fail at startup, not on first request, if a demo coupon points at a venue or dish that is gone.
listCoupons(demoCoupons, catalog.venues, catalog.dishes);

const port = 4000;
createApp(staticCatalogRepository(catalog), "http://localhost:5173", { demoCoupons }).listen(port, () => {
  console.log(`Local API (data files, no database) listening on :${port}, demo coupons on`);
});
