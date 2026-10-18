import { useState } from "react";
import { Button } from "@/components/ui/button";
import { currentPosition, PRESET_ORIGINS, type Origin } from "@/utils/origins";

interface Props {
  value: Origin;
  onChange: (o: Origin) => void;
}

export function OriginPicker({ value, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);

  const useMyLocation = () => {
    setError(null);
    currentPosition().then(onChange).catch((e: Error) => setError(e.message));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Where are you">
        {PRESET_ORIGINS.map((o) => (
          <Button key={o.id} size="sm" variant={value.id === o.id ? "default" : "outline"} onClick={() => onChange(o)}>
            {o.label}
          </Button>
        ))}
        <Button size="sm" variant={value.id === "gps" ? "default" : "outline"} onClick={useMyLocation}>
          Use my location
        </Button>
      </div>
      {error !== null && <p role="alert" className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
