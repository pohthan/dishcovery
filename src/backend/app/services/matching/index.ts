import type { Coupon, Dish, MatchResponse, Profile, Venue, VenueMatch } from "@ail/shared";
import { rankClosest } from "./closest";
import { matchDish } from "./dish-match";
import { distanceMetres, type LatLng } from "./geo";
import { resolveLimits } from "./limits";

export interface MatchInput {
  profile: Profile;
  venues: Venue[];
  dishes: Dish[];
  coupons: Coupon[];
  origin: LatLng | null;
}

const fitRatio = (v: VenueMatch) => (v.totalCount === 0 ? 0 : v.matchedCount / v.totalCount);

/** Venues with a matching dish first, then venues without menu data, then venues with no match. */
function compareVenues(a: VenueMatch, b: VenueMatch): number {
  const rank = (v: VenueMatch) => (v.matchedCount > 0 ? 0 : v.totalCount === 0 ? 1 : 2);
  if (rank(a) !== rank(b)) return rank(a) - rank(b);
  const fit = fitRatio(b) - fitRatio(a);
  if (fit !== 0) return fit;
  const da = a.distanceMetres ?? Number.POSITIVE_INFINITY;
  const db = b.distanceMetres ?? Number.POSITIVE_INFINITY;
  if (da !== db) return da - db;
  return a.venue.name.localeCompare(b.venue.name);
}

/** Ranks by suitability then distance. Coupons are attached after matching and never affect order. */
export function matchVenues(input: MatchInput): MatchResponse {
  const { limits, inactive } = resolveLimits(input.profile);

  const venues = input.venues
    .map((venue): VenueMatch => {
      const venueCoupons = input.coupons.filter((c) => c.venueId === venue.id);
      const dishes = input.dishes
        .filter((d) => d.venueId === venue.id)
        .map((d) => matchDish(d, venue, input.profile, limits, venueCoupons));
      return {
        venue,
        distanceMetres: input.origin ? distanceMetres(input.origin, venue) : null,
        matchedCount: dishes.filter((d) => d.matches).length,
        totalCount: dishes.length,
        dishes,
      };
    })
    .sort(compareVenues);

  return { venues, closest: rankClosest(venues), inactiveRules: inactive };
}

export { resolveLimits } from "./limits";
