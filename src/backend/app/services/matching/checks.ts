import type { Confidence, Dish, MealLimits, NutrientKey, OverBy, RuleCheck } from "@ail/shared";

const CONFIDENCE_ORDER: Confidence[] = ["low", "medium", "high"];

export function checkDish(dish: Dish, limits: MealLimits): RuleCheck[] {
  return (Object.entries(limits) as [NutrientKey, number][]).map(([nutrient, limit]) => {
    const found = dish.nutrients[nutrient];
    if (found === undefined) {
      return { nutrient, limit, value: null, status: "unknown", provenance: null, confidence: null };
    }
    return {
      nutrient,
      limit,
      value: found.value,
      status: found.value <= limit ? "within" : "exceeds",
      provenance: found.provenance,
      confidence: found.confidence,
    };
  });
}

/** Weakest confidence among checks that had data; null when none did. */
export function lowestConfidence(checks: RuleCheck[]): Confidence | null {
  const present = checks.flatMap((c) => (c.confidence === null ? [] : [c.confidence]));
  if (present.length === 0) return null;
  return present.reduce((a, b) => (CONFIDENCE_ORDER.indexOf(a) <= CONFIDENCE_ORDER.indexOf(b) ? a : b));
}

/** The overage for every nutrient that is over its limit. */
export function overages(checks: RuleCheck[]): OverBy[] {
  return checks.flatMap((c) =>
    c.status === "exceeds" && c.value !== null
      ? [{ nutrient: c.nutrient, amount: c.value - c.limit, ratio: (c.value - c.limit) / c.limit }]
      : [],
  );
}
