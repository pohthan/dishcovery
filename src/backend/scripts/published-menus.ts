import { z } from "zod";
import { Dish, NutrientKey } from "@ail/shared";

const PerServing = z.partialRecord(NutrientKey, z.number().nonnegative());

const ToastBoxFile = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      serving_ml: z.number().positive(),
      per_serving: PerServing,
    }),
  ),
});

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Values printed by the restaurant itself, so provenance is restaurant_published with high confidence. */
function publishedNutrients(values: z.infer<typeof PerServing>) {
  return Object.fromEntries(
    Object.entries(values).map(([k, value]) => [k, { value, provenance: "restaurant_published", confidence: "high" }]),
  );
}

/**
 * Toast Box Dec 2023 beverage panel, attached to each given venue. Every beverage here is
 * meat-free, so vegetarian is true. Serving size is stored as millilitres in servingGrams.
 */
export function buildToastBoxDishes(json: unknown, venueIds: string[]): Dish[] {
  const { items } = ToastBoxFile.parse(json);
  return venueIds.flatMap((venueId) =>
    items.map((item) =>
      Dish.parse({
        id: `${venueId}--${slug(item.name)}`,
        venueId,
        name: item.name,
        priceSgd: null,
        servingGrams: item.serving_ml,
        nutrients: publishedNutrients(item.per_serving),
        vegetarian: true,
        menuSource: "restaurant",
      }),
    ),
  );
}
