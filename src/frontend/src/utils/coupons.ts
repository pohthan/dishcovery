/** Local calendar date as YYYY-MM-DD. */
function today(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** A coupon is valid through the whole of its last day. No end date means it does not expire. */
export function isExpired(validUntil: string | null, now: Date = new Date()): boolean {
  return validUntil !== null && validUntil < today(now);
}

export function describeValidity(validUntil: string | null, now: Date = new Date()): string {
  if (validUntil === null) return "No expiry date";
  const date = new Date(`${validUntil}T00:00:00`).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
  return isExpired(validUntil, now) ? `Expired on ${date}` : `Valid until ${date}`;
}

/** What the QR code carries. The DEMO prefix means it can never be mistaken for a real redemption. */
export function demoQrValue(couponId: string, code: string): string {
  return `DISHCOVERY-DEMO|${couponId}|${code}`;
}
