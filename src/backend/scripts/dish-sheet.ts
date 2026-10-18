import { parse } from "csv-parse/sync";
import { z } from "zod";
import { Dish, MenuSource, type NutrientKey, type NutrientMap, type Venue } from "@ail/shared";

/**
 * The upload sheet, data/upload/dishes.csv: one row per dish, nutrients on the same row.
 *   - A row with no dish_name is a placeholder for its venue and is skipped.
 *   - A blank nutrient cell means unknown, never zero.
 *   - Any mistake fails the load and names the row, so bad data never reaches a screen.
 */

/** The most dishes the sheet may hold. The project is kept to this many menu items on purpose. */
export const MAX_DISHES = 10;

export const SHEET_COLUMNS = [
  "venue_id", "venue_name", "dish_name", "vegetarian", "menu_source", "menu_source_url",
  "serving_description", "serving_g", "energy_kcal", "carbs_g", "sugar_g", "fiber_g",
  "sodium_mg", "potassium_mg", "phosphorus_mg", "nutrient_source", "hpb_item_name", "notes",
] as const;

const NUTRIENT_COLUMNS: Array<[string, NutrientKey]> = [
  ["energy_kcal", "energy_kcal"], ["carbs_g", "carbs_g"], ["sugar_g", "sugar_g"], ["fiber_g", "fiber_g"],
  ["sodium_mg", "sodium_mg"], ["potassium_mg", "potassium_mg"], ["phosphorus_mg", "phosphorus_mg"],
];

/** How much to trust a nutrient number, by where it came from. */
const NUTRIENT_SOURCES = {
  // HPB SG FoodID with the type of source not recorded: treated as the lower confidence.
  // Record hpb_lab, hpb_database or hpb_recipe (shown on the SG FoodID item) to say more.
  sgfoodid: { provenance: "database_matched", confidence: "low", needsHpbItem: true },
  hpb_lab: { provenance: "database_matched", confidence: "medium", needsHpbItem: true },
  hpb_database: { provenance: "database_matched", confidence: "medium", needsHpbItem: true },
  hpb_recipe: { provenance: "database_matched", confidence: "low", needsHpbItem: true },
  restaurant: { provenance: "restaurant_published", confidence: "high", needsHpbItem: false },
} as const;

/** Wording people actually type, including how SG FoodID labels where an item's data came from. */
const SOURCE_ALIASES: Record<string, keyof typeof NUTRIENT_SOURCES> = {
  sgfoodid: "sgfoodid",
  hpb_lab: "hpb_lab", lab: "hpb_lab", lab_analysis: "hpb_lab", lab_analyses: "hpb_lab", laboratory: "hpb_lab",
  nutrient_analyses_from_laboratories: "hpb_lab",
  hpb_database: "hpb_database", database: "hpb_database", international_database: "hpb_database",
  international_databases: "hpb_database", established_international_food_databases: "hpb_database",
  hpb_recipe: "hpb_recipe", recipe: "hpb_recipe", recipe_calculation: "hpb_recipe", recipe_calculations: "hpb_recipe",
  restaurant: "restaurant",
};

/** Lower-case, and treat any run of spaces, dashes or punctuation as one underscore. */
const sourceKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").replace("sg_foodid", "sgfoodid");

const Row = z.record(z.string(), z.string());
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function number(where: string, column: string, value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${where}: ${column} must be a number of 0 or more, got "${value}"`);
  return n;
}

function vegetarian(where: string, value: string): boolean | null {
  const v = value.toLowerCase();
  if (v === "yes") return true;
  if (v === "no") return false;
  if (v === "" || v === "unknown") return null;
  throw new Error(`${where}: vegetarian must be yes, no or blank, got "${value}"`);
}

export function parseDishSheet(csvText: string, venues: Venue[]): Dish[] {
  const rows = (parse(csvText, { columns: true, skip_empty_lines: true, trim: true, bom: true }) as unknown[]).map((r) => Row.parse(r));
  const missing = SHEET_COLUMNS.filter((c) => rows[0] !== undefined && !(c in rows[0]));
  if (missing.length > 0) throw new Error(`dishes.csv is missing columns: ${missing.join(", ")}`);

  const seen = new Set<string>();
  const dishes: Dish[] = [];

  rows.forEach((raw, i) => {
    // The header check above guarantees every column exists; give each cell a plain string type.
    const r = Object.fromEntries(SHEET_COLUMNS.map((c) => [c, raw[c] ?? ""])) as Record<(typeof SHEET_COLUMNS)[number], string>;
    const where = `dishes.csv row ${i + 2}`;
    const venue = venues.find((v) => v.id === r.venue_id);
    if (venue === undefined) throw new Error(`${where}: unknown venue_id "${r.venue_id}"`);
    if (r.venue_name !== venue.name) {
      throw new Error(`${where}: venue_name "${r.venue_name}" does not match "${venue.name}" for ${venue.id}. Do not edit venue_id or venue_name`);
    }
    if (r.dish_name === "") return;
    if (venue.kind === "food_centre") throw new Error(`${where}: ${venue.name} is a food court. Put dishes on its stalls instead`);

    const menuSource = MenuSource.safeParse(r.menu_source);
    if (!menuSource.success) throw new Error(`${where}: menu_source must be restaurant or third_party, got "${r.menu_source}"`);

    const id = `${venue.id}--${slug(r.dish_name)}`;
    if (seen.has(id)) throw new Error(`${where}: "${r.dish_name}" appears twice for ${venue.name}`);
    seen.add(id);

    const nutrients: NutrientMap = {};
    const filled = NUTRIENT_COLUMNS.filter(([column]) => r[column as keyof typeof r] !== "");
    if (filled.length > 0) {
      const sourceName = SOURCE_ALIASES[sourceKey(r.nutrient_source)];
      const source = sourceName === undefined ? undefined : NUTRIENT_SOURCES[sourceName];
      if (source === undefined) throw new Error(`${where}: nutrient_source must be SGFoodID, Lab Analysis, Database, Recipe calculation or Restaurant, got "${r.nutrient_source}"`);
      if (r.serving_g === "") throw new Error(`${where}: serving_g is required when nutrient values are filled in`);
      if (source.needsHpbItem && r.hpb_item_name === "") throw new Error(`${where}: hpb_item_name is required for HPB values`);
      for (const [column, key] of filled) {
        nutrients[key] = { value: number(where, column, r[column as keyof typeof r]), provenance: source.provenance, confidence: source.confidence };
      }
    }

    dishes.push(
      Dish.parse({
        id,
        venueId: venue.id,
        name: r.dish_name,
        priceSgd: null,
        servingGrams: r.serving_g === "" ? null : number(where, "serving_g", r.serving_g),
        nutrients,
        vegetarian: vegetarian(where, r.vegetarian),
        menuSource: menuSource.data,
      }),
    );
  });

  if (dishes.length > MAX_DISHES) {
    throw new Error(`dishes.csv has ${dishes.length} dishes but the limit is ${MAX_DISHES}. Remove ${dishes.length - MAX_DISHES} (clear the dish_name, or delete the row)`);
  }
  return dishes;
}
