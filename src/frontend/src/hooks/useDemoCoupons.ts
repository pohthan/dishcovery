import { useEffect, useState } from "react";
import type { CouponListResponse } from "@ail/shared";
import { getDemoCoupons } from "@/services/api";

export type DemoCouponsState =
  | { status: "loading" }
  | { status: "off" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CouponListResponse };

export function useDemoCoupons(): DemoCouponsState {
  const [state, setState] = useState<DemoCouponsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    getDemoCoupons()
      .then((data) => !cancelled && setState(data === null ? { status: "off" } : { status: "ready", data }))
      .catch((err: Error) => !cancelled && setState({ status: "error", message: err.message }));
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
