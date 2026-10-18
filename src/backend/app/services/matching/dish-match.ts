import type { Coupon, Dish, DishMatch, ExclusionReason, MealLimits, Profile, Venue } from "@ail/shared";
import { checkDish, lowestConfidence, overages } from "./checks";

/** A coupon applies when it is venue-wide or names this dish. */
function couponsFor(dish: Dish, coupons: Coupon[]): Coupon[] {
  return coupons.filter((c) => c.dishIds.length === 0 || c.dishIds.includes(dish.id));
}

export function matchDish(
  dish: Dish,
  venue: Venue,
  profile: Profile,
  limits: MealLimits,
  coupons: Coupon[],
): DishMatch {
  const checks = checkDish(dish, limits);
  const reasons: ExclusionReason[] = [];

  if (checks.some((c) => c.status === "exceeds")) reasons.push("exceeds_limit");
  if (checks.some((c) => c.status === "unknown")) reasons.push("missing_nutrient_data");
  if (profile.halalOnly && venue.halal.status !== "muis_certified") reasons.push("not_halal_verified");
  if (profile.vegetarianOnly && dish.vegetarian !== true) reasons.push("vegetarian_unknown_or_false");

  const matches = reasons.length === 0;
  const overBy = overages(checks);
  // A near miss is over a limit on data we actually have, and nothing else rules the dish out.
  const isNearMiss = reasons.length === 1 && reasons[0] === "exceeds_limit";
  return {
    dish,
    matches,
    checks,
    reasons,
    overBy,
    overLimitRatio: isNearMiss ? Math.max(...overBy.map((o) => o.ratio)) : null,
    confidence: lowestConfidence(checks),
    // Coupons are only ever shown on dishes that already fit; they never decide fit.
    coupons: matches ? couponsFor(dish, coupons) : [],
  };
}
