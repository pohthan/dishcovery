import { describe, expect, it } from "vitest";
import { matchVenues, resolveLimits } from "../app/services/matching";
import { baseProfile, coupon, dish, venue } from "./fixtures";

const origin = { lat: 1.2835, lng: 103.8515 };
const run = (profile = baseProfile, dishes = [dish("d1", "v1", { sodium_mg: 500 })], coupons = [coupon("c1", "v1")], venues = [venue("v1")]) =>
  matchVenues({ profile, venues, dishes, coupons, origin });

describe("resolveLimits", () => {
  it("derives per-meal sodium as one third of the daily preset", () => {
    expect(resolveLimits({ ...baseProfile, sodiumPreset: "singapore_2000" }).limits.sodium_mg).toBe(667);
    expect(resolveLimits({ ...baseProfile, sodiumPreset: "ada_kdoqi_2300" }).limits.sodium_mg).toBe(767);
  });

  it("lets an explicit limit override the preset", () => {
    const r = resolveLimits({ ...baseProfile, sodiumPreset: "singapore_2000", limits: { sodium_mg: 400 } });
    expect(r.limits.sodium_mg).toBe(400);
  });

  it("never invents potassium, phosphorus or carb limits; reports them inactive", () => {
    const r = resolveLimits({ ...baseProfile, conditions: ["ckd", "diabetes"], sodiumPreset: "singapore_2000" });
    expect(r.limits.potassium_mg).toBeUndefined();
    expect(r.limits.carbs_g).toBeUndefined();
    expect(r.inactive.map((i) => i.nutrient).sort()).toEqual(["carbs_g", "phosphorus_mg", "potassium_mg", "sugar_g"]);
  });
});

describe("dish matching", () => {
  const profile = { ...baseProfile, sodiumPreset: "singapore_2000" as const };

  it("matches a dish within the limit and flags its confidence", () => {
    const m = run(profile).venues[0]!.dishes[0]!;
    expect(m.matches).toBe(true);
    expect(m.confidence).toBe("low");
  });

  it("excludes a dish that exceeds the limit", () => {
    const m = run(profile, [dish("d1", "v1", { sodium_mg: 900 })]).venues[0]!.dishes[0]!;
    expect(m.matches).toBe(false);
    expect(m.reasons).toEqual(["exceeds_limit"]);
  });

  it("excludes a dish when a limited nutrient is missing, never guessing", () => {
    const m = run(profile, [dish("d1", "v1", { carbs_g: 30 })]).venues[0]!.dishes[0]!;
    expect(m.matches).toBe(false);
    expect(m.reasons).toEqual(["missing_nutrient_data"]);
  });

  it("treats a value exactly at the limit as within", () => {
    const m = run(profile, [dish("d1", "v1", { sodium_mg: 667 })]).venues[0]!.dishes[0]!;
    expect(m.matches).toBe(true);
  });

  it("reports the weakest confidence across checked nutrients", () => {
    const d = dish("d1", "v1", { sodium_mg: 500 });
    d.nutrients.carbs_g = { value: 20, provenance: "restaurant_published", confidence: "high" };
    const m = run({ ...profile, limits: { carbs_g: 60 } }, [d]).venues[0]!.dishes[0]!;
    expect(m.confidence).toBe("low");
  });
});

describe("halal and vegetarian", () => {
  it("excludes unverified venues for halal-only users", () => {
    const m = run({ ...baseProfile, halalOnly: true }).venues[0]!.dishes[0]!;
    expect(m.reasons).toEqual(["not_halal_verified"]);
  });

  it("accepts MUIS-certified venues", () => {
    const v = venue("v1", { halal: { status: "muis_certified", checkedOn: "2026-10-05", certificateNo: "EEHK20230000001" } });
    const m = run({ ...baseProfile, halalOnly: true }, undefined, undefined, [v]).venues[0]!.dishes[0]!;
    expect(m.matches).toBe(true);
  });

  it("excludes dishes with unknown vegetarian status", () => {
    const m = run({ ...baseProfile, vegetarianOnly: true }).venues[0]!.dishes[0]!;
    expect(m.reasons).toEqual(["vegetarian_unknown_or_false"]);
  });
});

describe("coupons", () => {
  const profile = { ...baseProfile, sodiumPreset: "singapore_2000" as const };

  it("attaches coupons only to dishes that match", () => {
    const dishes = [dish("ok", "v1", { sodium_mg: 100 }), dish("bad", "v1", { sodium_mg: 2000 })];
    const res = run(profile, dishes, [coupon("c1", "v1")]).venues[0]!.dishes;
    expect(res.find((d) => d.dish.id === "ok")!.coupons).toHaveLength(1);
    expect(res.find((d) => d.dish.id === "bad")!.coupons).toHaveLength(0);
  });

  it("respects dish-specific coupons", () => {
    const dishes = [dish("a", "v1", { sodium_mg: 100 }), dish("b", "v1", { sodium_mg: 100 })];
    const res = run(profile, dishes, [coupon("c1", "v1", ["a"])]).venues[0]!.dishes;
    expect(res.find((d) => d.dish.id === "a")!.coupons).toHaveLength(1);
    expect(res.find((d) => d.dish.id === "b")!.coupons).toHaveLength(0);
  });

  it("never changes venue ranking", () => {
    const venues = [venue("near", { lat: 1.2836 }), venue("far", { lat: 1.30 })];
    const dishes = [dish("n", "near", { sodium_mg: 100 }), dish("f", "far", { sodium_mg: 100 })];
    const without = matchVenues({ profile, venues, dishes, coupons: [], origin });
    const withC = matchVenues({ profile, venues, dishes, coupons: [coupon("c1", "far")], origin });
    expect(withC.venues.map((v) => v.venue.id)).toEqual(without.venues.map((v) => v.venue.id));
    expect(withC.venues[0]!.venue.id).toBe("near");
  });
});

describe("ranking", () => {
  const profile = { ...baseProfile, sodiumPreset: "singapore_2000" as const };

  it("ranks venues with a match above venues with none, then by fit, then distance", () => {
    const venues = [venue("none", { lat: 1.2836 }), venue("half", { lat: 1.29 }), venue("full", { lat: 1.31 })];
    const dishes = [
      dish("n1", "none", { sodium_mg: 2000 }),
      dish("h1", "half", { sodium_mg: 100 }),
      dish("h2", "half", { sodium_mg: 2000 }),
      dish("f1", "full", { sodium_mg: 100 }),
    ];
    const res = matchVenues({ profile, venues, dishes, coupons: [], origin });
    expect(res.venues.map((v) => v.venue.id)).toEqual(["full", "half", "none"]);
  });

  it("keeps venues with no menu data, ranked after matches but before non-matches", () => {
    const venues = [venue("nomatch"), venue("empty"), venue("match")];
    const dishes = [dish("a", "nomatch", { sodium_mg: 2000 }), dish("b", "match", { sodium_mg: 100 })];
    const res = matchVenues({ profile, venues, dishes, coupons: [], origin });
    expect(res.venues.map((v) => v.venue.id)).toEqual(["match", "empty", "nomatch"]);
    expect(res.venues[1]!.totalCount).toBe(0);
  });
});
