import { SODIUM_PRESETS, type Condition, type MealLimits, type NutrientKey, type SodiumPreset } from "@ail/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NUTRIENT_LABELS } from "@/utils/copy";

/** Nutrients a user can set a per-meal limit for, by condition. Sodium is always offered. */
const LIMIT_FIELDS: Record<Condition, NutrientKey[]> = {
  hypertension: [],
  diabetes: ["carbs_g", "sugar_g"],
  ckd: ["potassium_mg", "phosphorus_mg"],
};

const PRESET_LABELS: Record<SodiumPreset, string> = {
  singapore_2000: `Singapore guideline (${SODIUM_PRESETS.singapore_2000.toLocaleString()} mg a day)`,
  ada_kdoqi_2300: `Diabetes / kidney guideline (${SODIUM_PRESETS.ada_kdoqi_2300.toLocaleString()} mg a day)`,
};

interface Props {
  conditions: Condition[];
  sodiumPreset: SodiumPreset | null;
  limits: MealLimits;
  onPreset: (p: SodiumPreset | null) => void;
  onLimit: (n: NutrientKey, value: number | null) => void;
}

export function LimitsForm({ conditions, sodiumPreset, limits, onPreset, onLimit }: Props) {
  const extra = [...new Set(conditions.flatMap((c) => LIMIT_FIELDS[c]))];
  const fields: NutrientKey[] = ["sodium_mg", ...extra];

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 font-medium">Daily sodium target</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRESET_LABELS) as SodiumPreset[]).map((p) => (
            <Button key={p} type="button" variant={sodiumPreset === p ? "default" : "outline"} aria-pressed={sodiumPreset === p} onClick={() => onPreset(p)}>
              {PRESET_LABELS[p]}
            </Button>
          ))}
          <Button type="button" variant={sodiumPreset === null ? "default" : "outline"} aria-pressed={sodiumPreset === null} onClick={() => onPreset(null)}>
            I will enter my own
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">We use about one third of this for a single meal.</p>
      </div>

      <div>
        <p className="mb-1 font-medium">Limits from your care team, per meal (optional)</p>
        <p className="mb-3 text-sm text-muted-foreground">
          Potassium, phosphorus and carbohydrate targets are set by your clinician, so we only apply them if you enter them.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((n) => (
            <div key={n} className="space-y-1">
              <Label htmlFor={n}>{NUTRIENT_LABELS[n]} limit per meal</Label>
              <Input
                id={n}
                type="number"
                min={1}
                inputMode="numeric"
                value={limits[n] ?? ""}
                onChange={(e) => onLimit(n, e.target.value === "" ? null : Number(e.target.value))}
                placeholder={n.endsWith("_mg") ? "mg" : "g"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
