import { NUTRIENT_UNITS, type NutrientKey } from "@ail/shared";

export function formatDistance(metres: number | null): string | null {
  if (metres === null) return null;
  return metres < 1000 ? `${metres} m` : `${(metres / 1000).toFixed(1)} km`;
}

export function formatNutrient(nutrient: NutrientKey, value: number): string {
  return `${Math.round(value).toLocaleString("en-SG")} ${NUTRIENT_UNITS[nutrient]}`;
}
