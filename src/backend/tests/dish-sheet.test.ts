import { readFileSync } from "node:fs";
import { parse as parseCsv } from "csv-parse/sync";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { matchVenues } from "../app/services/matching";
import { repoDataRoot } from "../scripts/data-root";
import { MAX_DISHES, SHEET_COLUMNS, parseDishSheet } from "../scripts/dish-sheet";
import { loadCatalogData } from "../scripts/load-catalog";
import { baseProfile, venue } from "./fixtures";

const venues = [
  venue("court", { name: "Food Court", kind: "food_centre" }),
  venue("stall", { name: "Noodle Stall", kind: "food_centre_stall" }),
];
const HEADER = SHEET_COLUMNS.join(",");
const row = (cells: Record<string, string>) =>
  SHEET_COLUMNS.map((c) => `"${cells[c] ?? (c === "venue_id" ? "stall" : c === "venue_name" ? "Noodle Stall" : c === "menu_source" ? "third_party" : "")}"`).join(",");
const sheet = (...rows: string[]) => [HEADER, ...rows].join("\n");
const parse = (...rows: string[]) => parseDishSheet(sheet(...rows), venues);

describe("parseDishSheet", () => {
  it("reads a dish with no nutrients as unknown, with no serving size", () => {
    const [d] = parse(row({ dish_name: "Ban mian" }));
    expect(d).toMatchObject({ id: "stall--ban-mian", venueId: "stall", name: "Ban mian", servingGrams: null, nutrients: {}, vegetarian: null, menuSource: "third_party" });
  });

  it("skips a placeholder row with no dish name", () => {
    expect(parse(row({}))).toEqual([]);
  });

  it("reads HPB nutrients with their source, and leaves blank cells unknown instead of zero", () => {
    const [d] = parse(row({ dish_name: "Ban mian", serving_g: "450", sodium_mg: "1800", carbs_g: "55", nutrient_source: "hpb_lab", hpb_item_name: "Ban mian, soup" }));
    expect(d!.servingGrams).toBe(450);
    expect(d!.nutrients.sodium_mg).toEqual({ value: 1800, provenance: "database_matched", confidence: "medium" });
    expect(d!.nutrients.carbs_g?.value).toBe(55);
    expect(d!.nutrients.potassium_mg).toBeUndefined();
  });

  it("rates recipe-calculated HPB values low, and restaurant-published values high", () => {
    const [a, b] = parse(
      row({ dish_name: "A", serving_g: "100", sodium_mg: "10", nutrient_source: "hpb_recipe", hpb_item_name: "A" }),
      row({ dish_name: "B", serving_g: "100", sodium_mg: "10", nutrient_source: "restaurant" }),
    );
    expect(a!.nutrients.sodium_mg).toMatchObject({ provenance: "database_matched", confidence: "low" });
    expect(b!.nutrients.sodium_mg).toMatchObject({ provenance: "restaurant_published", confidence: "high" });
  });

  it("accepts SGFoodID as the source, in any spelling, as lower confidence", () => {
    for (const spelling of ["SGFoodID", "sgfoodid", "SG FoodID", "sg_foodid", "SG-FoodID"]) {
      const [d] = parse(row({ dish_name: "A", serving_g: "100", sodium_mg: "10", nutrient_source: spelling, hpb_item_name: "Ban mian (soup)" }));
      expect(d!.nutrients.sodium_mg, spelling).toMatchObject({ provenance: "database_matched", confidence: "low" });
    }
    expect(() => parse(row({ dish_name: "A", serving_g: "100", sodium_mg: "10", nutrient_source: "SGFoodID" }))).toThrow(/hpb_item_name/);
  });

  it("understands SG FoodID's own labels for where an item's data came from", () => {
    const confidenceOf = (label: string) => parse(row({ dish_name: "A", serving_g: "100", sodium_mg: "10", nutrient_source: label, hpb_item_name: "X" }))[0]!.nutrients.sodium_mg!.confidence;
    for (const label of ["Lab Analysis", "lab analyses", "Nutrient analyses from laboratories", "HPB Lab"]) expect(confidenceOf(label), label).toBe("medium");
    for (const label of ["Database", "Established international food databases", "hpb_database"]) expect(confidenceOf(label), label).toBe("medium");
    for (const label of ["Recipe calculation", "Recipe calculations", "recipe"]) expect(confidenceOf(label), label).toBe("low");
    expect(confidenceOf("SGFoodID")).toBe("low");
  });

  it("still rejects a source it does not recognise, naming the row", () => {
    expect(() => parse(row({ dish_name: "A", serving_g: "100", sodium_mg: "10", nutrient_source: "my guess", hpb_item_name: "X" }))).toThrow(/row 2: nutrient_source must be/);
  });

  it("reads vegetarian as yes, no or unknown", () => {
    const [y, n, u] = parse(row({ dish_name: "Y", vegetarian: "yes" }), row({ dish_name: "N", vegetarian: "no" }), row({ dish_name: "U", vegetarian: "" }));
    expect([y!.vegetarian, n!.vegetarian, u!.vegetarian]).toEqual([true, false, null]);
  });

  it("accepts a file saved from Excel with a byte order mark", () => {
    expect(parseDishSheet("﻿" + sheet(row({ dish_name: "Ban mian" })), venues)).toHaveLength(1);
  });

  it("fails loudly, naming the row, on every kind of mistake", () => {
    expect(() => parse(row({ venue_id: "nope", dish_name: "X" }))).toThrow(/row 2: unknown venue_id/);
    expect(() => parse(row({ venue_name: "Wrong Name", dish_name: "X" }))).toThrow(/does not match/);
    expect(() => parse(row({ venue_id: "court", venue_name: "Food Court", dish_name: "X" }))).toThrow(/food court/);
    expect(() => parse(row({ dish_name: "X", menu_source: "guess" }))).toThrow(/menu_source/);
    expect(() => parse(row({ dish_name: "X", vegetarian: "maybe" }))).toThrow(/vegetarian/);
    expect(() => parse(row({ dish_name: "X", sodium_mg: "500" }))).toThrow(/nutrient_source/);
    expect(() => parse(row({ dish_name: "X", sodium_mg: "500", nutrient_source: "hpb_lab" }))).toThrow(/serving_g/);
    expect(() => parse(row({ dish_name: "X", sodium_mg: "500", serving_g: "100", nutrient_source: "hpb_lab" }))).toThrow(/hpb_item_name/);
    expect(() => parse(row({ dish_name: "X", sodium_mg: "lots", serving_g: "100", nutrient_source: "restaurant" }))).toThrow(/number/);
    expect(() => parse(row({ dish_name: "X", sodium_mg: "-5", serving_g: "100", nutrient_source: "restaurant" }))).toThrow(/number/);
    expect(() => parse(row({ dish_name: "Ban mian" }), row({ dish_name: "Ban Mian" }))).toThrow(/twice/);
    expect(() => parseDishSheet("venue_id,dish_name\nstall,X", venues)).toThrow(/missing columns/);
  });
});

describe("the dish limit", () => {
  const dishRows = (n: number) => Array.from({ length: n }, (_, i) => row({ dish_name: `Dish ${i}` }));

  it("allows exactly the limit", () => {
    expect(MAX_DISHES).toBe(10);
    expect(parse(...dishRows(MAX_DISHES))).toHaveLength(MAX_DISHES);
  });

  it("refuses one more, and says how many to remove", () => {
    expect(() => parse(...dishRows(MAX_DISHES + 1))).toThrow(/11 dishes but the limit is 10. Remove 1/);
  });

  it("does not count placeholder rows", () => {
    expect(parse(...dishRows(MAX_DISHES), row({}), row({}))).toHaveLength(MAX_DISHES);
  });
});

describe("a filled sheet drives matching", () => {
  it("excludes a dish with no nutrients for a user with a limit, and matches one that fits", () => {
    const dishes = parse(
      row({ dish_name: "Pending" }),
      row({ dish_name: "Light", serving_g: "300", sodium_mg: "400", nutrient_source: "restaurant" }),
      row({ dish_name: "Salty", serving_g: "300", sodium_mg: "2000", nutrient_source: "restaurant" }),
    );
    const res = matchVenues({ profile: { ...baseProfile, sodiumPreset: "singapore_2000" }, venues: [venues[1]!], dishes, coupons: [], origin: null });
    const by = Object.fromEntries(res.venues[0]!.dishes.map((d) => [d.dish.name, d]));
    expect(by.Light!.matches).toBe(true);
    expect(by.Pending!.reasons).toEqual(["missing_nutrient_data"]);
    expect(by.Salty!.reasons).toEqual(["exceeds_limit"]);
  });
});

describe("the real upload sheet", () => {
  const csv = readFileSync(fileURLToPath(new URL("upload/dishes.csv", repoDataRoot)), "utf-8");

  it("loads", async () => {
    const catalog = await loadCatalogData(repoDataRoot);
    expect(catalog.dishes.length).toBeGreaterThan(0);
  });

  it("holds no more than the dish limit", async () => {
    const { dishes } = await loadCatalogData(repoDataRoot);
    expect(dishes.length).toBeLessThanOrEqual(MAX_DISHES);
  });

  // Read with a real CSV parser, so a line break inside a cell cannot miscount rows.
  const records = () => parseCsv(csv, { columns: true, bom: true, skip_empty_lines: true }) as Array<Record<string, string>>;

  it("asks for data on at most 10 places, and never on the food courts", async () => {
    const { venues: all } = await loadCatalogData(repoDataRoot);
    const ids = new Set(records().map((r) => r.venue_id!));
    expect(ids.size).toBeGreaterThan(0);
    expect(ids.size).toBeLessThanOrEqual(10);
    for (const id of ids) expect(all.find((v) => v.id === id)?.kind).not.toBe("food_centre");
  });

  it("has no empty rows: every row is a dish", async () => {
    const { dishes } = await loadCatalogData(repoDataRoot);
    expect(records()).toHaveLength(dishes.length);
  });

  it("contains no demo data and no coupons", async () => {
    const catalog = await loadCatalogData(repoDataRoot);
    expect(catalog.venues.some((v) => /sample/i.test(v.name))).toBe(false);
    expect(catalog.coupons).toHaveLength(0);
  });
});
