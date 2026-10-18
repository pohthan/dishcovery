import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { matchVenues } from "../app/services/matching";
import { buildToastBoxDishes } from "../scripts/published-menus";
import { baseProfile, venue } from "./fixtures";

const file = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../data/published/toastbox-beverages.json", import.meta.url)), "utf-8"),
) as unknown;

describe("Toast Box published beverages", () => {
  const dishes = buildToastBoxDishes(file, ["a", "b"]);

  it("attaches every beverage to each venue with unique ids", () => {
    expect(dishes).toHaveLength(46);
    expect(new Set(dishes.map((d) => d.id)).size).toBe(46);
  });

  it("marks values as restaurant published, high confidence", () => {
    const kopi = dishes.find((d) => d.name === "Kopi O (10oz)")!;
    expect(kopi.nutrients.sodium_mg).toEqual({ value: 19.5, provenance: "restaurant_published", confidence: "high" });
    expect(kopi.nutrients.sugar_g?.value).toBe(20.8);
  });

  it("has no potassium or phosphorus, so a kidney user with those limits excludes them", () => {
    const res = matchVenues({
      profile: { ...baseProfile, conditions: ["ckd"], limits: { potassium_mg: 700 } },
      venues: [venue("a")],
      dishes: dishes.filter((d) => d.venueId === "a"),
      coupons: [],
      origin: null,
    });
    expect(res.venues[0]!.matchedCount).toBe(0);
    expect(res.venues[0]!.dishes[0]!.reasons).toContain("missing_nutrient_data");
  });

  it("lets a diabetic user with a sugar limit see the lower-sugar drinks", () => {
    const res = matchVenues({
      profile: { ...baseProfile, conditions: ["diabetes"], limits: { sugar_g: 21 } },
      venues: [venue("a")],
      dishes: dishes.filter((d) => d.venueId === "a"),
      coupons: [],
      origin: null,
    });
    const names = res.venues[0]!.dishes.filter((d) => d.matches).map((d) => d.dish.name);
    expect(names).toContain("Kopi O (10oz)");
    expect(names).not.toContain("Milo Dinosaur (Cold)");
  });
});
