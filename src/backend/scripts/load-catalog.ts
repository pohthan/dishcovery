import { readFile } from "node:fs/promises";
import type { Catalog } from "../app/repositories/catalog.repository";
import { parseDishSheet } from "./dish-sheet";
import { buildVenues } from "./venues";

/**
 * Everything the app serves, built from the files under `dataRoot` (the data/ folder):
 * venues from SMU's official store directory, MUIS halal certificates linked to the stalls that
 * hold them, and dishes with their nutrients from the upload sheet, upload/dishes.csv.
 * There is no demo data and no real coupon data yet. Earlier venue sets are in data/archive.
 */
export async function loadCatalogData(dataRoot: URL): Promise<Catalog> {
  const readText = (name: string) => readFile(new URL(name, dataRoot), "utf-8");
  const readJson = async (name: string): Promise<unknown> => JSON.parse(await readText(name));

  const venues = buildVenues(await readJson("venues/smu.json"), await readJson("published/muis-halal-smu.json"));
  const dishes = parseDishSheet(await readText("upload/dishes.csv"), venues);
  return { venues, dishes, coupons: [] };
}
