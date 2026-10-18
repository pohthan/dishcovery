import type { DishMatch } from "@ail/shared";
import { Badge } from "@/components/ui/badge";
import { MENU_SOURCE_LABELS, NUTRIENT_LABELS, REASON_LABELS } from "@/utils/copy";
import { formatNutrient } from "@/utils/format";

export function DishRow({ match }: { match: DishMatch }) {
  const { dish, checks, reasons, coupons } = match;

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{dish.name}</span>
        {MENU_SOURCE_LABELS[dish.menuSource] !== null && (
          <Badge variant="outline">{MENU_SOURCE_LABELS[dish.menuSource]}</Badge>
        )}
        {!match.matches && reasons.map((r) => <Badge key={r} variant="secondary">{REASON_LABELS[r]}</Badge>)}
      </div>

      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {checks.map((c) => (
          <li key={c.nutrient}>
            {NUTRIENT_LABELS[c.nutrient]}{" "}
            {c.value === null ? "unknown" : `~${formatNutrient(c.nutrient, c.value)}`} of{" "}
            {formatNutrient(c.nutrient, c.limit)} per meal
            {c.status === "exceeds" && c.value !== null && ` (${formatNutrient(c.nutrient, c.value - c.limit)} over)`}
          </li>
        ))}
      </ul>

      {coupons.map((c) => (
        <p key={c.id} className="mt-2 text-sm">
          <Badge variant="outline">Coupon</Badge>{" "}
          <span className="font-mono">{c.code}</span> {c.description}
        </p>
      ))}
    </li>
  );
}
