import { Coupon, Dish, Venue } from "@ail/shared";
import { CouponModel } from "../models/coupon.model";
import { DishModel } from "../models/dish.model";
import { VenueModel } from "../models/venue.model";

export interface Catalog {
  venues: Venue[];
  dishes: Dish[];
  coupons: Coupon[];
}

export interface CatalogRepository {
  loadCatalog(): Promise<Catalog>;
}

/** Documents are re-validated on read so bad data fails loudly instead of leaking into matching. */
export class MongoCatalogRepository implements CatalogRepository {
  async loadCatalog(): Promise<Catalog> {
    const [venues, dishes, coupons] = await Promise.all([
      VenueModel.find({}, { _id: 0 }).lean(),
      DishModel.find({}, { _id: 0 }).lean(),
      CouponModel.find({}, { _id: 0 }).lean(),
    ]);
    return {
      venues: venues.map((v) => Venue.parse(v)),
      dishes: dishes.map((d) => Dish.parse(d)),
      coupons: coupons.map((c) => Coupon.parse(c)),
    };
  }
}
