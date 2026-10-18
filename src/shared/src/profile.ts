import { z } from "zod";
import { NutrientKey } from "./nutrients";

export const CONDITIONS = ["ckd", "diabetes", "hypertension"] as const;
export const Condition = z.enum(CONDITIONS);
export type Condition = z.infer<typeof Condition>;

/** Guideline-backed sodium presets, expressed as a daily budget in mg. */
export const SODIUM_PRESETS = {
  singapore_2000: 2000,
  ada_kdoqi_2300: 2300,
} as const;
export const SodiumPreset = z.enum(["singapore_2000", "ada_kdoqi_2300"]);
export type SodiumPreset = z.infer<typeof SodiumPreset>;

/** Per-meal ceilings entered by the user (from their care team). Never defaulted. */
export const MealLimits = z.partialRecord(NutrientKey, z.number().positive());
export type MealLimits = z.infer<typeof MealLimits>;

export const Profile = z.object({
  conditions: z.array(Condition),
  sodiumPreset: SodiumPreset.nullable(),
  /** Explicit per-meal limits. Overrides any preset for the same nutrient. */
  limits: MealLimits,
  halalOnly: z.boolean(),
  vegetarianOnly: z.boolean(),
});
export type Profile = z.infer<typeof Profile>;
