/**
 * Vercel serverless entry. The build script bundles this file together with a copy of data/ into one
 * function, so the catalog is read from the data folder that sits beside the bundle. There is no
 * database. The page and API share an origin, so CORS is off.
 *
 * Set DEMO_COUPONS=true in the Vercel project settings to turn on the coupons demo page.
 */
import { loadDemoCoupons } from "../scripts/demo-coupons";
import { loadCatalogData } from "../scripts/load-catalog";
import { listCoupons } from "./services/coupons/listing";
import { createApp } from "./app";
import { staticCatalogRepository } from "./repositories/static.catalog.repository";

const dataRoot = new URL("./data/", import.meta.url);
const catalog = await loadCatalogData(dataRoot);

let demoCoupons;
if (process.env.DEMO_COUPONS === "true") {
  demoCoupons = await loadDemoCoupons(dataRoot);
  // A broken demo coupon stops the function starting, instead of failing on the first visit.
  listCoupons(demoCoupons, catalog.venues, catalog.dishes);
}

export default createApp(staticCatalogRepository(catalog), null, { demoCoupons });
