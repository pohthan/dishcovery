import { z } from "zod";
import { NutrientKey, Confidence, Provenance } from "./nutrients";
import { Coupon, Dish, Venue } from "./venue";
import { Profile } from "./profile";

export const MatchRequest = z.object({
  profile: Profile,
  origin: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).nullable(),
});
export type MatchRequest = z.infer<typeof MatchRequest>;

export const RuleStatus = z.enum(["within", "exceeds", "unknown"]);
export type RuleStatus = z.infer<typeof RuleStatus>;

export const RuleCheck = z.object({
  nutrient: NutrientKey,
  limit: z.number(),
  value: z.number().nullable(),
  status: RuleStatus,
  provenance: Provenance.nullable(),
  confidence: Confidence.nullable(),
});
export type RuleCheck = z.infer<typeof RuleCheck>;

export const ExclusionReason = z.enum([
  "exceeds_limit",
  "missing_nutrient_data",
  "not_halal_verified",
  "vegetarian_unknown_or_false",
]);
export type ExclusionReason = z.infer<typeof ExclusionReason>;

/** How far one nutrient is over the user's limit. ratio 0.2 means 20% over. */
export const OverBy = z.object({
  nutrient: NutrientKey,
  amount: z.number(),
  ratio: z.number(),
});
export type OverBy = z.infer<typeof OverBy>;

export const DishMatch = z.object({
  dish: Dish,
  matches: z.boolean(),
  checks: z.array(RuleCheck),
  reasons: z.array(ExclusionReason),
  /** Every nutrient that is over its limit, with the overage. Empty when nothing is over. */
  overBy: z.array(OverBy),
  /**
   * The worst overage as a ratio, set only for a near miss: over a limit on data we have, with the
   * halal and vegetarian filters satisfied and no missing data. Null otherwise.
   */
  overLimitRatio: z.number().nullable(),
  /** Lowest confidence among checked nutrients; null when no rules are active. */
  confidence: Confidence.nullable(),
  coupons: z.array(Coupon),
});
export type DishMatch = z.infer<typeof DishMatch>;

/** A nutrient the user's conditions care about but no limit is set for. */
export const InactiveRule = z.object({
  nutrient: NutrientKey,
  reason: z.literal("limit_not_set"),
});
export type InactiveRule = z.infer<typeof InactiveRule>;

export const VenueMatch = z.object({
  venue: Venue,
  distanceMetres: z.number().nullable(),
  matchedCount: z.number().int(),
  totalCount: z.number().int(),
  dishes: z.array(DishMatch),
});
export type VenueMatch = z.infer<typeof VenueMatch>;

/** A dish that is only slightly over a limit, pointing at its venue and dish. */
export const ClosestMatch = z.object({
  venueId: z.string(),
  dishId: z.string(),
  overLimitRatio: z.number(),
});
export type ClosestMatch = z.infer<typeof ClosestMatch>;

export const MatchResponse = z.object({
  venues: z.array(VenueMatch),
  /** Near misses across all venues, least over first. */
  closest: z.array(ClosestMatch),
  inactiveRules: z.array(InactiveRule),
});
export type MatchResponse = z.infer<typeof MatchResponse>;
