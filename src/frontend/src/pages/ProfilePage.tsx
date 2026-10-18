import { useState } from "react";
import type { Condition, MealLimits, NutrientKey, Profile, SodiumPreset } from "@ail/shared";
import { ConditionPicker } from "@/components/ConditionPicker";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { LimitsForm } from "@/components/LimitsForm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { APP_NAME } from "@/utils/copy";

const EMPTY_PROFILE: Profile = {
  conditions: [],
  sodiumPreset: "singapore_2000",
  limits: {},
  halalOnly: false,
  vegetarianOnly: false,
};

interface Props {
  initial: Profile | null;
  onSave: (p: Profile) => void;
}

export function ProfilePage({ initial, onSave }: Props) {
  const [profile, setProfile] = useState<Profile>(initial ?? EMPTY_PROFILE);
  const patch = (p: Partial<Profile>) => setProfile((cur) => ({ ...cur, ...p }));

  const setLimit = (n: NutrientKey, value: number | null) => {
    const next: MealLimits = { ...profile.limits };
    if (value === null) delete next[n];
    else next[n] = value;
    patch({ limits: next });
  };

  return (
    <form
      className="mx-auto max-w-2xl space-y-8 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(profile);
      }}
    >
      <header>
        <p className="text-sm font-semibold tracking-wide text-muted-foreground">{APP_NAME}</p>
        <h1 className="text-2xl font-semibold">Find a lunch that fits your limits</h1>
        <p className="mt-1 text-muted-foreground">Tell us about your health needs. This stays on your device.</p>
      </header>

      <section className="space-y-2">
        <h2 className="font-medium">Your conditions</h2>
        <ConditionPicker value={profile.conditions} onChange={(c: Condition[]) => patch({ conditions: c })} />
      </section>

      <LimitsForm
        conditions={profile.conditions}
        sodiumPreset={profile.sodiumPreset}
        limits={profile.limits}
        onPreset={(p: SodiumPreset | null) => patch({ sodiumPreset: p })}
        onLimit={setLimit}
      />

      <section className="space-y-3">
        <h2 className="font-medium">Food preferences</h2>
        <div className="flex items-center gap-3">
          <Switch id="halal" checked={profile.halalOnly} onCheckedChange={(v) => patch({ halalOnly: v })} />
          <Label htmlFor="halal">Halal only (MUIS certified venues)</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="veg" checked={profile.vegetarianOnly} onCheckedChange={(v) => patch({ vegetarianOnly: v })} />
          <Label htmlFor="veg">Vegetarian only</Label>
        </div>
      </section>

      <DisclaimerBanner />
      <Button type="submit" size="lg" className="w-full">Show places near me</Button>
    </form>
  );
}
