import { describe, expect, it } from "vitest";
import { demoQrValue, describeValidity, isExpired } from "@/utils/coupons";
import { parseRoute } from "@/utils/hashRoute";

const noon = (iso: string) => new Date(`${iso}T12:00:00`);

describe("isExpired", () => {
  it("never expires without an end date", () => {
    expect(isExpired(null, noon("2099-01-01"))).toBe(false);
  });

  it("is still valid on its last day, expired the day after", () => {
    expect(isExpired("2026-10-08", noon("2026-10-08"))).toBe(false);
    expect(isExpired("2026-10-08", new Date("2026-10-08T23:59:00"))).toBe(false);
    expect(isExpired("2026-10-08", noon("2026-10-09"))).toBe(true);
  });

  it("compares dates across month and year ends", () => {
    expect(isExpired("2026-12-31", noon("2027-01-01"))).toBe(true);
    expect(isExpired("2026-11-30", noon("2026-12-01"))).toBe(true);
    expect(isExpired("2026-12-31", noon("2026-11-30"))).toBe(false);
  });
});

describe("describeValidity", () => {
  it("says no expiry, valid until, or expired", () => {
    expect(describeValidity(null)).toBe("No expiry date");
    expect(describeValidity("2999-12-31", noon("2026-10-08"))).toMatch(/^Valid until .*2999/);
    expect(describeValidity("2000-01-01", noon("2026-10-08"))).toMatch(/^Expired on .*2000/);
  });
});

describe("demoQrValue", () => {
  it("is marked DEMO so it can never pass for a real redemption", () => {
    expect(demoQrValue("c1", "DEMO-X")).toBe("DISHCOVERY-DEMO|c1|DEMO-X");
  });
});

describe("parseRoute", () => {
  it("opens the coupons demo only for its own hash", () => {
    expect(parseRoute("#/coupons-demo")).toBe("coupons-demo");
    expect(parseRoute("")).toBe("home");
    expect(parseRoute("#/other")).toBe("home");
  });
});
