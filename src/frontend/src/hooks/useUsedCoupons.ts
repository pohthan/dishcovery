import { useCallback, useState } from "react";
import { z } from "zod";

const KEY = "ail.demoCouponsUsed.v1";
const Stored = z.array(z.string());

function load(storage: Storage): Set<string> {
  const raw = storage.getItem(KEY);
  if (raw === null) return new Set();
  const parsed = Stored.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    storage.removeItem(KEY);
    console.warn("Stored demo coupon state was invalid and has been cleared", parsed.error.issues);
    return new Set();
  }
  return new Set(parsed.data);
}

/**
 * Which demo coupons have been marked used, kept in this browser only. A real coupon would be
 * checked and spent by the venue, so this is a demonstration of the flow, not a safeguard.
 */
export function useUsedCoupons(storage: Storage = localStorage) {
  const [used, setUsed] = useState<Set<string>>(() => load(storage));

  const save = useCallback(
    (next: Set<string>) => {
      storage.setItem(KEY, JSON.stringify([...next]));
      setUsed(next);
    },
    [storage],
  );

  return {
    used,
    markUsed: (id: string) => save(new Set(used).add(id)),
    reset: () => {
      storage.removeItem(KEY);
      setUsed(new Set());
    },
  };
}
