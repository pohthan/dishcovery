import { createApp } from "./app";
import { loadConfig } from "./core/config";
import { connectDb } from "./core/db";
import { MongoCatalogRepository } from "./repositories/catalog.repository";
import { repoDataRoot } from "../scripts/data-root";
import { loadDemoCoupons } from "../scripts/demo-coupons";

const config = loadConfig();
await connectDb(config.MONGODB_URI);
const demoCoupons = config.DEMO_COUPONS === "true" ? await loadDemoCoupons(repoDataRoot) : undefined;
createApp(new MongoCatalogRepository(), config.CORS_ORIGIN, { demoCoupons }).listen(config.PORT, () => {
  console.log(`API listening on :${config.PORT}`);
});
