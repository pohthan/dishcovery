import type { ClosestMatch, VenueMatch } from "@ail/shared";

/** A dish counts as "close" when its worst nutrient is no more than this far over the limit (0.5 = 50%). */
export const CLOSE_MATCH_MAX_OVER = 0.5;
export const CLOSE_MATCH_LIMIT = 5;

/**
 * The dishes nearest to fitting, least over first, ties broken by distance. Only near misses count:
 * a dish with missing data, or one ruled out by halal or vegetarian, is never "close". Coupons play
 * no part here.
 */
export function rankClosest(venues: VenueMatch[]): ClosestMatch[] {
  const distance = new Map(venues.map((v) => [v.venue.id, v.distanceMetres ?? Number.POSITIVE_INFINITY]));
  return venues
    .flatMap((v) =>
      v.dishes.flatMap((d) =>
        d.overLimitRatio !== null && d.overLimitRatio <= CLOSE_MATCH_MAX_OVER
          ? [{ venueId: v.venue.id, dishId: d.dish.id, overLimitRatio: d.overLimitRatio }]
          : [],
      ),
    )
    .sort(
      (a, b) =>
        a.overLimitRatio - b.overLimitRatio ||
        distance.get(a.venueId)! - distance.get(b.venueId)! ||
        a.dishId.localeCompare(b.dishId),
    )
    .slice(0, CLOSE_MATCH_LIMIT);
}
