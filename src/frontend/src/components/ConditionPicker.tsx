import { CONDITIONS, type Condition } from "@ail/shared";
import { Button } from "@/components/ui/button";
import { CONDITION_LABELS } from "@/utils/copy";

interface Props {
  value: Condition[];
  onChange: (next: Condition[]) => void;
}

export function ConditionPicker({ value, onChange }: Props) {
  const toggle = (c: Condition) =>
    onChange(value.includes(c) ? value.filter((x) => x !== c) : [...value, c]);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Your conditions">
      {CONDITIONS.map((c) => (
        <Button
          key={c}
          type="button"
          variant={value.includes(c) ? "default" : "outline"}
          aria-pressed={value.includes(c)}
          onClick={() => toggle(c)}
        >
          {CONDITION_LABELS[c]}
        </Button>
      ))}
    </div>
  );
}
