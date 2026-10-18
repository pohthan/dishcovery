import type { Coupon, Dish, Profile, Venue, NutrientKey, Confidence, Provenance } from "@ail/shared";

export function venue(id: string, over: Partial<Venue> = {}): Venue {
  return {
    id,
    name: `Venue ${id}`,
    kind: "chain",
    address: "1 Test St",
    lat: 1.2835,
    lng: 103.8515,
    halal: { status: "unverified", checkedOn: null, certificateNo: null },
    menuNote: null,
    vegetarianOptions: null,
    ...over,
  };
}

export function dish(
  id: string,
  venueId: string,
  nutrients: Partial<Record<NutrientKey, number>>,
  over: Partial<Dish> = {},
  prov: { provenance: Provenance; confidence: Confidence } = {
    provenance: "estimated_from_ingredients",
    confidence: "low",
  },
): Dish {
  return {
    id,
    venueId,
    name: `Dish ${id}`,
    priceSgd: 6,
    servingGrams: 400,
    nutrients: Object.fromEntries(Object.entries(nutrients).map(([k, v]) => [k, { value: v, ...prov }])),
    vegetarian: null,
    menuSource: "third_party",
    ...over,
  };
}

export function coupon(id: string, venueId: string, dishIds: string[] = []): Coupon {
  return { id, venueId, code: id.toUpperCase(), description: "10% off", validUntil: null, dishIds };
}

export const baseProfile: Profile = {
  conditions: [],
  sodiumPreset: null,
  limits: {},
  halalOnly: false,
  vegetarianOnly: false,
};
