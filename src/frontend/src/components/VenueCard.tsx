import type { VenueMatch } from "@ail/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DishRow } from "@/components/DishRow";
import { COUPON_COPY } from "@/utils/copy";
import { formatDistance } from "@/utils/format";

interface Props {
  match: VenueMatch;
  selected: boolean;
  onSelect: (venueId: string) => void;
  /** How many demo coupons this venue has. Zero hides the button. */
  demoCouponCount?: number;
  onOpenCoupons?: () => void;
}

export function VenueCard({ match, selected, onSelect, demoCouponCount = 0, onOpenCoupons }: Props) {
  const { venue, dishes } = match;
  const fitting = dishes.filter((d) => d.matches);
  const excluded = dishes.filter((d) => !d.matches);
  const distance = formatDistance(match.distanceMetres);

  return (
    <Card
      id={`venue-${venue.id}`}
      aria-current={selected}
      className={selected ? "ring-2 ring-green-600" : undefined}
      onClick={() => onSelect(venue.id)}
    >
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {venue.name}
          {venue.vegetarianOptions === true && <Badge variant="secondary">Has vegetarian options</Badge>}
          {venue.halal.status === "muis_certified" && <Badge variant="secondary" title={venue.halal.certificateNo === null ? undefined : `MUIS certificate ${venue.halal.certificateNo}, checked ${venue.halal.checkedOn ?? "date unknown"}`}>Halal (MUIS certified)</Badge>}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {distance !== null && `${distance} away · `}
          {match.totalCount === 0
            ? "No menu data yet, so we cannot check dishes here"
            : `${fitting.length} of ${match.totalCount} dishes match your limits`}
        </p>
        {demoCouponCount > 0 && onOpenCoupons !== undefined && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCoupons();
            }}
          >
            {COUPON_COPY.openCoupons} ({demoCouponCount})
          </Button>
        )}
        {venue.menuNote !== null && <p className="text-sm text-amber-800">{venue.menuNote}</p>}
      </CardHeader>
      <CardContent>
        {fitting.length > 0 && (
          <ul className="divide-y">
            {fitting.map((d) => <DishRow key={d.dish.id} match={d} />)}
          </ul>
        )}
        {excluded.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Why {excluded.length} dish{excluded.length === 1 ? " is" : "es are"} not shown
            </summary>
            <ul className="divide-y">
              {excluded.map((d) => <DishRow key={d.dish.id} match={d} />)}
            </ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
