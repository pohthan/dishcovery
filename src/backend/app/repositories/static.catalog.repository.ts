import type { Catalog, CatalogRepository } from "./catalog.repository";

/** Serves a catalog loaded once at startup. Used by the local server and the Vercel function. */
export function staticCatalogRepository(catalog: Catalog): CatalogRepository {
  return { loadCatalog: async () => catalog };
}
