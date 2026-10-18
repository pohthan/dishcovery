import { z } from "zod";
import { NutrientMap } from "./nutrients";

export const HalalStatus = z.enum(["muis_certified", "unverified"]);
export type HalalStatus = z.infer<typeof HalalStatus>;

/** true/false when known, null when the data does not say. Unknown never counts as a match. */
export const TriState = z.boolean().nullable();

/** Who vouches for the dish being on the menu: the restaurant itself, or a third-party listing. */
export const MenuSource = z.enum(["restaurant", "third_party"]);
export type MenuSource = z.infer<typeof MenuSource>;

export const Dish = z.object({
  id: z.string(),
  venueId: z.string(),
  name: z.string(),
  priceSgd: z.number().nonnegative().nullable(),
  /** Null until a real serving size is known (for example before HPB data is filled in). */
  servingGrams: z.number().positive().nullable(),
  nutrients: NutrientMap,
  vegetarian: TriState,
  menuSource: MenuSource,
});
export type Dish = z.infer<typeof Dish>;

export const Coupon = z.object({
  id: z.string(),
  venueId: z.string(),
  code: z.string(),
  description: z.string(),
  validUntil: z.string().nullable(),
  /** Restricts the coupon to specific dishes; empty means venue-wide. */
  dishIds: z.array(z.string()),
});
export type Coupon = z.infer<typeof Coupon>;

export const Venue = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(["food_centre", "hawker_stall", "food_centre_stall", "chain", "restaurant", "canteen"]),
  address: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  halal: z.object({
    status: HalalStatus,
    checkedOn: z.string().nullable(),
    /** MUIS certificate number the status was verified against. */
    certificateNo: z.string().nullable(),
  }),
  /** Caveat shown on the venue card, e.g. when only part of the menu is covered. */
  menuNote: z.string().nullable(),
  /** Whether the outlet offers vegetarian dishes (outlet-level, from the operator). Null when unknown. */
  vegetarianOptions: z.boolean().nullable(),
});
export type Venue = z.infer<typeof Venue>;
