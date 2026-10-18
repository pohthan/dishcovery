import cors from "cors";
import express from "express";
import type { Coupon } from "@ail/shared";
import { demoCouponRoutes } from "./api/demo-coupons.routes";
import { errorHandler } from "./api/errors";
import { matchRoutes } from "./api/match.routes";
import type { CatalogRepository } from "./repositories/catalog.repository";

export interface AppOptions {
  /** When given, GET /api/demo/coupons is served. Leave out to keep demo coupons off. */
  demoCoupons?: Coupon[];
}

/** Pass null for corsOrigin when the page and the API are served from the same origin (no CORS needed). */
export function createApp(repo: CatalogRepository, corsOrigin: string | null, options: AppOptions = {}) {
  const app = express();
  if (corsOrigin !== null) app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: "20kb" }));
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", matchRoutes(repo));
  if (options.demoCoupons !== undefined) app.use("/api", demoCouponRoutes(repo, options.demoCoupons));
  app.use(errorHandler);
  return app;
}
