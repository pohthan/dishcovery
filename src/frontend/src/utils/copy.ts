import type { Condition, ExclusionReason, NutrientKey } from "@ail/shared";

export const APP_NAME = "Dishcovery";

/** All user-facing wording lives here. Never say "safe"; see docs/01-clinical-rules.md. */

export const CONDITION_LABELS: Record<Condition, string> = {
  hypertension: "High blood pressure",
  diabetes: "Diabetes",
  ckd: "Kidney disease",
};

export const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  sodium_mg: "Sodium",
  potassium_mg: "Potassium",
  phosphorus_mg: "Phosphorus",
  carbs_g: "Carbohydrate",
  sugar_g: "Sugar",
  energy_kcal: "Energy",
  fiber_g: "Fibre",
};

export const REASON_LABELS: Record<ExclusionReason, string> = {
  exceeds_limit: "Above your limit",
  missing_nutrient_data: "Not enough nutrient data",
  not_halal_verified: "Halal not verified",
  vegetarian_unknown_or_false: "Not confirmed vegetarian",
};

export const MENU_SOURCE_LABELS = {
  restaurant: null,
  third_party: "Unverified menu: confirm at the stall",
} as const;

export const CLOSEST_COPY = {
  heading: "Closest options",
  intro: "Nothing fits your limits exactly. These are the nearest, and how far over each one is.",
  alsoIntro: "Only a few dishes fit exactly. These are slightly over your limit:",
  unknownOne: "dish cannot be checked yet because its nutrient data is missing.",
  unknownMany: "dishes cannot be checked yet because their nutrient data is missing.",
  noneClose: "No dish is close to your limits.",
} as const;

export const COUPON_COPY = {
  pageTitle: "Coupons demo",
  back: "Back to places",
  demoBanner:
    "Demo only. These coupons are made up to show how coupons will work. They are not offers from these venues and cannot be used.",
  demoBadge: "Demo",
  usedBadge: "Marked used",
  expiredBadge: "Expired",
  howTitle: "How coupons will work",
  howItWorks: [
    "A coupon only appears on a dish that already fits your limits. Coupons never decide what fits and never change the order of results.",
    "Show the code or QR code at the counter. The venue applies the discount, so Dishcovery does not process payments.",
    "Real coupons will come from the restaurants themselves.",
  ],
  venueWide: "Any dish at this venue",
  dishOnly: "Only on",
  showAtCounter: "Show at counter",
  redeemDemoNote: "Demo coupon: staff will not honour this. Real coupons will look like this.",
  markUsed: "Mark as used",
  reset: "Reset demo",
  atVenueTitle: "Demo coupons at",
  atVenueIntro: "Made-up offers to show how coupons will work. Staff will not honour them.",
  openCoupons: "Demo coupons",
  off: "Demo coupons are switched off on this server.",
  loadFailed: "Demo coupons could not be loaded.",
  notDemo: "These coupons were not marked as demo by the server, so they are not shown as offers.",
} as const;

export const DISCLAIMER =
  "These matches use estimated nutrient values and are not medical advice. Check with your care team. This app does not cover food allergies.";
