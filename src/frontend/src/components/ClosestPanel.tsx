import type { ClosestMatch, DishMatch, VenueMatch } from "@ail/shared";
import { Badge } from "@/components/ui/badge";
import { CLOSEST_COPY, NUTRIENT_LABELS } from "@/utils/copy";
import { formatDistance, formatNutrient } from "@/utils/format";

interface Props {
  closest: ClosestMatch[];
  venues: VenueMatch[];
  exactCount: number;
  /** Dishes that had every needed nutrient, so could be judged at all. */
  checkedCount: number;
  unknownCount: number;
  onSelect: (venueId: string) => void;
}

/** Fewer exact matches than this and we also show the nearest misses. */
export const SHOW_CLOSEST_BELOW = 3;

function find(venues: VenueMatch[], c: ClosestMatch): { venue: VenueMatch; dish: DishMatch } | null {
  const venue = venues.find((v) => v.venue.id === c.venueId);
  const dish = venue?.dishes.find((d) => d.dish.id === c.dishId);
  return venue && dish ? { venue, dish } : null;
}

export function ClosestPanel({ closest, venues, exactCount, checkedCount, unknownCount, onSelect }: Props) {
  const showClosest = checkedCount > 0 && exactCount < SHOW_CLOSEST_BELOW;
  const rows = showClosest ? closest.flatMap((c) => find(venues, c) ?? []) : [];

  if (!showClosest && unknownCount === 0) return null;

  return (
    <section aria-label={CLOSEST_COPY.heading} className="space-y-2 rounded-lg border p-3">
      {showClosest && (
        <>
          <h2 className="font-semibold">{CLOSEST_COPY.heading}</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{CLOSEST_COPY.noneClose}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {exactCount === 0 ? CLOSEST_COPY.intro : CLOSEST_COPY.alsoIntro}
              </p>
              <ul className="divide-y">
                {rows.map(({ venue, dish }) => (
                  <li key={dish.dish.id} className="py-2">
                    <button type="button" className="text-left" onClick={() => onSelect(venue.venue.id)}>
                      <span className="font-medium">{dish.dish.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {" "}at {venue.venue.name}
                        {formatDistance(venue.distanceMetres) !== null && ` · ${formatDistance(venue.distanceMetres)}`}
                      </span>
                    </button>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {dish.overBy.map((o) => (
                        <Badge key={o.nutrient} variant="outline">
                          {NUTRIENT_LABELS[o.nutrient]} {formatNutrient(o.nutrient, o.amount)} over (about{" "}
                          {Math.round(o.ratio * 100)}%)
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      {unknownCount > 0 && (
        <p role="status" className="text-sm text-muted-foreground">
          {unknownCount} {unknownCount === 1 ? CLOSEST_COPY.unknownOne : CLOSEST_COPY.unknownMany}
        </p>
      )}
    </section>
  );
}
