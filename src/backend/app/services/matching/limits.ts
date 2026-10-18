import {
  SODIUM_PRESETS,
  type Condition,
  type InactiveRule,
  type MealLimits,
  type NutrientKey,
  type Profile,
} from "@ail/shared";

const MEALS_PER_DAY = 3;

/** Nutrients each condition needs a limit for (docs/01-clinical-rules.md). */
const RELEVANT_NUTRIENTS: Record<Condition, NutrientKey[]> = {
  hypertension: ["sodium_mg"],
  diabetes: ["carbs_g", "sugar_g", "sodium_mg"],
  ckd: ["sodium_mg", "potassium_mg", "phosphorus_mg"],
};

export interface ResolvedLimits {
  limits: MealLimits;
  inactive: InactiveRule[];
}

/**
 * Per-meal limits actually applied. A user-entered limit always wins; the only
 * preset is sodium, derived as one third of the daily budget. Everything else
 * stays off until the user sets it, and is reported as inactive.
 */
export function resolveLimits(profile: Profile): ResolvedLimits {
  const limits: MealLimits = { ...profile.limits };

  if (limits.sodium_mg === undefined && profile.sodiumPreset !== null) {
    limits.sodium_mg = Math.round(SODIUM_PRESETS[profile.sodiumPreset] / MEALS_PER_DAY);
  }

  const relevant = new Set(profile.conditions.flatMap((c) => RELEVANT_NUTRIENTS[c]));
  const inactive: InactiveRule[] = [...relevant]
    .filter((nutrient) => limits[nutrient] === undefined)
    .map((nutrient) => ({ nutrient, reason: "limit_not_set" as const }));

  return { limits, inactive };
}
