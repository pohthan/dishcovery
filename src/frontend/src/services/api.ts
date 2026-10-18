import { CouponListResponse, MatchResponse, type MatchRequest } from "@ail/shared";

export async function postMatch(request: MatchRequest): Promise<MatchResponse> {
  const res = await fetch("/api/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`Match request failed (${res.status}): ${detail}`);
  }
  return MatchResponse.parse(await res.json());
}

/** Returns null when the server has demo coupons switched off (it answers 404). Any other failure throws. */
export async function getDemoCoupons(): Promise<CouponListResponse | null> {
  const res = await fetch("/api/demo/coupons");
  if (res.status === 404) return null;
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`Could not load demo coupons (${res.status}): ${detail}`);
  }
  return CouponListResponse.parse(await res.json());
}
