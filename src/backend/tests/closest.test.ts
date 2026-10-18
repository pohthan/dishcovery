import type { Profile } from "@ail/shared";
import { describe, expect, it } from "vitest";
import { CLOSE_MATCH_LIMIT, CLOSE_MATCH_MAX_OVER } from "../app/services/matching/closest";
import { matchVenues } from "../app/services/matching";
import { baseProfile, coupon, dish, venue } from "./fixtures";

// Singapore preset gives a per-meal sodium limit of 667 mg.
const profile = { ...baseProfile, sodiumPreset: "singapore_2000" as const };
const origin = { lat: 1.2835, lng: 103.8515 };
const run = (dishes: ReturnType<typeof dish>[], over: Partial<Profile> = {}, venues = [venue("v1")], coupons = [coupon("c1", "v1")]) =>
  matchVenues({ profile: { ...profile, ...over }, venues, dishes, coupons, origin });

describe("near misses", () => {
  it("reports how far over the limit a dish is", () => {
    const m = run([dish("d", "v1", { sodium_mg: 800 })]).venues[0]!.dishes[0]!;
    expect(m.matches).toBe(false);
    expect(m.overBy).toEqual([{ nutrient: "sodium_mg", amount: 133, ratio: 133 / 667 }]);
    expect(m.overLimitRatio).toBeCloseTo(0.2, 1);
  });

  it("lists a dish just over the limit in closest", () => {
    const res = run([dish("d", "v1", { sodium_mg: 800 })]);
    expect(res.closest).toHaveLength(1);
    expect(res.closest[0]).toMatchObject({ venueId: "v1", dishId: "d" });
  });

  it("does not call a dish close when it is far over, though the overage is still reported", () => {
    const tooFar = Math.round(667 * (1 + CLOSE_MATCH_MAX_OVER + 0.3));
    const res = run([dish("d", "v1", { sodium_mg: tooFar })]);
    expect(res.venues[0]!.dishes[0]!.overBy).toHaveLength(1);
    expect(res.closest).toHaveLength(0);
  });

  it("treats a dish exactly at the cut-off as close", () => {
    const res = run([dish("d", "v1", { sodium_mg: 1000.5 })]);
    expect(res.venues[0]!.dishes[0]!.overLimitRatio).toBeCloseTo(CLOSE_MATCH_MAX_OVER, 2);
    expect(res.closest).toHaveLength(1);
  });

  it("never counts a dish that fits as close", () => {
    const res = run([dish("d", "v1", { sodium_mg: 300 })]);
    expect(res.venues[0]!.dishes[0]!.overLimitRatio).toBeNull();
    expect(res.closest).toHaveLength(0);
  });

  it("never counts a dish with missing data as close, since that would be guessing", () => {
    const res = run([dish("d", "v1", { carbs_g: 30 })]);
    expect(res.venues[0]!.dishes[0]!.reasons).toEqual(["missing_nutrient_data"]);
    expect(res.closest).toHaveLength(0);
  });

  it("does not count a dish over one limit and missing another", () => {
    const res = run([dish("d", "v1", { sodium_mg: 800 })], { limits: { carbs_g: 60 } });
    expect(res.venues[0]!.dishes[0]!.reasons).toEqual(["exceeds_limit", "missing_nutrient_data"]);
    expect(res.closest).toHaveLength(0);
  });

  it("never offers a dish that fails the halal filter, even if only slightly over", () => {
    const res = run([dish("d", "v1", { sodium_mg: 700 })], { halalOnly: true });
    expect(res.venues[0]!.dishes[0]!.reasons).toContain("not_halal_verified");
    expect(res.closest).toHaveLength(0);
  });

  it("never offers a dish that fails the vegetarian filter", () => {
    const res = run([dish("d", "v1", { sodium_mg: 700 })], { vegetarianOnly: true });
    expect(res.closest).toHaveLength(0);
  });

  it("uses the worst overage when several nutrients are over", () => {
    const d = dish("d", "v1", { sodium_mg: 700, carbs_g: 66 });
    const res = run([d], { limits: { carbs_g: 60 } });
    const m = res.venues[0]!.dishes[0]!;
    expect(m.overBy).toHaveLength(2);
    expect(m.overLimitRatio).toBeCloseTo(0.1, 2);
  });
});

describe("closest ranking", () => {
  it("puts the least-over dish first", () => {
    const res = run([dish("far", "v1", { sodium_mg: 900 }), dish("near", "v1", { sodium_mg: 700 })]);
    expect(res.closest.map((c) => c.dishId)).toEqual(["near", "far"]);
  });

  it("breaks ties by distance", () => {
    const venues = [venue("far", { lat: 1.31 }), venue("near", { lat: 1.2836 })];
    const res = run([dish("a", "far", { sodium_mg: 700 }), dish("b", "near", { sodium_mg: 700 })], {}, venues, []);
    expect(res.closest.map((c) => c.venueId)).toEqual(["near", "far"]);
  });

  it("returns at most the limit", () => {
    const dishes = Array.from({ length: CLOSE_MATCH_LIMIT + 3 }, (_, i) => dish(`d${i}`, "v1", { sodium_mg: 700 + i }));
    expect(run(dishes).closest).toHaveLength(CLOSE_MATCH_LIMIT);
  });

  it("is empty when there are no active limits", () => {
    expect(run([dish("d", "v1", { sodium_mg: 5000 })], { sodiumPreset: null }).closest).toHaveLength(0);
  });

  it("is not changed by coupons and gives near misses no coupon", () => {
    const dishes = [dish("d", "v1", { sodium_mg: 700 })];
    const without = run(dishes, {}, [venue("v1")], []);
    const withCoupon = run(dishes, {}, [venue("v1")], [coupon("c1", "v1")]);
    expect(withCoupon.closest).toEqual(without.closest);
    expect(withCoupon.venues[0]!.dishes[0]!.coupons).toHaveLength(0);
  });
});
