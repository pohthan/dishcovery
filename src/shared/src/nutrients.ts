import { z } from "zod";

export const NUTRIENT_KEYS = [
  "sodium_mg",
  "potassium_mg",
  "phosphorus_mg",
  "carbs_g",
  "sugar_g",
  "energy_kcal",
  "fiber_g",
] as const;
export const NutrientKey = z.enum(NUTRIENT_KEYS);
export type NutrientKey = z.infer<typeof NutrientKey>;

/** Where a nutrient number came from. Drives the confidence label in the UI. */
export const Provenance = z.enum([
  "restaurant_published",
  "database_matched",
  "estimated_from_ingredients",
]);
export type Provenance = z.infer<typeof Provenance>;

export const Confidence = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof Confidence>;

export const NutrientValue = z.object({
  value: z.number().nonnegative(),
  provenance: Provenance,
  confidence: Confidence,
});
export type NutrientValue = z.infer<typeof NutrientValue>;

export const NutrientMap = z.partialRecord(NutrientKey, NutrientValue);
export type NutrientMap = z.infer<typeof NutrientMap>;

export const NUTRIENT_UNITS: Record<NutrientKey, string> = {
  sodium_mg: "mg",
  potassium_mg: "mg",
  phosphorus_mg: "mg",
  carbs_g: "g",
  sugar_g: "g",
  energy_kcal: "kcal",
  fiber_g: "g",
};
