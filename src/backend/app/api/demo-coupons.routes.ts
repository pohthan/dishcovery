import { Router } from "express";
import type { Coupon, CouponListResponse } from "@ail/shared";
import type { CatalogRepository } from "../repositories/catalog.repository";
import { listCoupons } from "../services/coupons/listing";

/**
 * Demonstration coupons only. They are kept apart from the real catalog so they can never show up in
 * match results, and the response says demo: true so every screen labels them.
 */
export function demoCouponRoutes(repo: CatalogRepository, demoCoupons: Coupon[]): Router {
  const router = Router();

  router.get("/demo/coupons", async (_req, res, next) => {
    try {
      const { venues, dishes } = await repo.loadCatalog();
      const body: CouponListResponse = { demo: true, coupons: listCoupons(demoCoupons, venues, dishes) };
      res.json(body);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
