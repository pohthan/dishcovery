import { Router } from "express";
import { MatchRequest } from "@ail/shared";
import type { CatalogRepository } from "../repositories/catalog.repository";
import { matchVenues } from "../services/matching";

/** Stateless: the profile arrives with each request and is never stored or logged. */
export function matchRoutes(repo: CatalogRepository): Router {
  const router = Router();

  router.post("/match", async (req, res, next) => {
    try {
      const { profile, origin } = MatchRequest.parse(req.body);
      const catalog = await repo.loadCatalog();
      res.json(matchVenues({ profile, origin, ...catalog }));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
