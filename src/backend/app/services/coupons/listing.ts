import type { Coupon, CouponListing, Dish, Venue } from "@ail/shared";

/**
 * Joins coupons to the venue and dish names people read. A coupon that points at a venue or dish
 * that does not exist is a data error and fails loudly, so a broken offer never reaches a screen.
 */
export function listCoupons(coupons: Coupon[], venues: Venue[], dishes: Dish[]): CouponListing[] {
  return coupons.map((coupon) => {
    const venue = venues.find((v) => v.id === coupon.venueId);
    if (venue === undefined) throw new Error(`Coupon ${coupon.id} points at unknown venue ${coupon.venueId}`);

    const dishNames = coupon.dishIds.map((id) => {
      const dish = dishes.find((d) => d.id === id);
      if (dish === undefined) throw new Error(`Coupon ${coupon.id} points at unknown dish ${id}`);
      if (dish.venueId !== coupon.venueId) throw new Error(`Coupon ${coupon.id} lists dish ${id} from another venue`);
      return dish.name;
    });

    return { coupon, venueName: venue.name, venueAddress: venue.address, dishNames };
  });
}
