import { DISCLAIMER } from "@/utils/copy";

export function DisclaimerBanner() {
  return (
    <p role="note" className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
      {DISCLAIMER}
    </p>
  );
}
