/**
 * Vercel serverless entry. The build script bundles this file together with a copy of data/ into one
 * CommonJS function, so the catalog is read from the data folder that sits beside the bundle. There is
 * no database. The page and API share an origin, so CORS is off.
 *
 * Nothing runs at load time: Vercel may load the file with require(), which cannot wait on top-level
 * await. The app is built on the first request instead, then reused.
 *
 * Set DEMO_COUPONS=true in the Vercel project settings to turn on the coupons demo page.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { loadDemoCoupons } from "../scripts/demo-coupons";
import { loadCatalogData } from "../scripts/load-catalog";
import { createApp } from "./app";
import { staticCatalogRepository } from "./repositories/static.catalog.repository";

const dataRoot = new URL("./data/", import.meta.url);

async function buildApp() {
  const catalog = await loadCatalogData(dataRoot);

  // The demo coupons are checked against the catalog when /api/demo/coupons is requested. A mistake
  // there makes that one endpoint answer 500 with the reason in the logs, and the search keeps working.
  const demoCoupons = process.env.DEMO_COUPONS === "true" ? await loadDemoCoupons(dataRoot) : undefined;

  return createApp(staticCatalogRepository(catalog), null, { demoCoupons });
}

let app: ReturnType<typeof buildApp> | undefined;

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  app ??= buildApp();
  try {
    (await app)(req, res);
  } catch (err) {
    // A bad data file stops the API on purpose. Say which, in the logs and in the response.
    console.error("API could not start or handle a request", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "api_failed", message: err instanceof Error ? err.message : String(err) }));
  }
}
