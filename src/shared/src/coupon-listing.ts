import { z } from "zod";
import { Coupon } from "./venue";

/** A coupon with the venue and dish names a person needs to read it. */
export const CouponListing = z.object({
  coupon: Coupon,
  venueName: z.string(),
  venueAddress: z.string(),
  /** Names of the dishes the coupon is limited to. Empty means it applies across the venue. */
  dishNames: z.array(z.string()),
});
export type CouponListing = z.infer<typeof CouponListing>;

export const CouponListResponse = z.object({
  /** True when every coupon here is a demonstration and not an offer from the venue. */
  demo: z.boolean(),
  coupons: z.array(CouponListing),
});
export type CouponListResponse = z.infer<typeof CouponListResponse>;
