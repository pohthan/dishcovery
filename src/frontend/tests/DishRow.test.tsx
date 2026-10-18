import type { DishMatch } from "@ail/shared";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DishRow } from "@/components/DishRow";

const dish = {
  id: "d1",
  venueId: "v1",
  name: "Test noodles",
  priceSgd: null,
  servingGrams: 300,
  nutrients: {},
  vegetarian: null,
  menuSource: "third_party" as const,
};

const matching: DishMatch = {
  dish,
  matches: true,
  checks: [
    { nutrient: "sodium_mg", limit: 667, value: 500, status: "within", provenance: "estimated_from_ingredients", confidence: "low" },
  ],
  reasons: [],
  overBy: [],
  overLimitRatio: null,
  confidence: "low",
  coupons: [{ id: "c1", venueId: "v1", code: "SAMPLE1", description: "10% off", validUntil: null, dishIds: [] }],
};

describe("DishRow", () => {
  it("shows the value against the limit, and never says safe", () => {
    const { container } = render(<ul><DishRow match={matching} /></ul>);
    expect(screen.getByText(/~500 mg of 667 mg per meal/)).toBeInTheDocument();
    expect(container.textContent?.toLowerCase()).not.toContain("safe");
  });

  it("shows no confidence or source indicator on a dish, whatever its confidence", () => {
    for (const confidence of ["low", "medium", "high"] as const) {
      const { container, unmount } = render(
        <ul><DishRow match={{ ...matching, confidence, checks: matching.checks.map((c) => ({ ...c, confidence })) }} /></ul>,
      );
      expect(container.textContent).not.toMatch(/confidence|estimate/i);
      unmount();
    }
  });

  it("flags a third-party menu as unverified", () => {
    render(<ul><DishRow match={matching} /></ul>);
    expect(screen.getByText(/Unverified menu/)).toBeInTheDocument();
  });

  it("shows a coupon on a matching dish", () => {
    render(<ul><DishRow match={matching} /></ul>);
    expect(screen.getByText("Coupon")).toBeInTheDocument();
    expect(screen.getByText("SAMPLE1")).toBeInTheDocument();
  });

  it("explains why an excluded dish is not shown", () => {
    const excluded: DishMatch = {
      ...matching,
      matches: false,
      reasons: ["missing_nutrient_data"],
      overBy: [],
      overLimitRatio: null,
      coupons: [],
      checks: [{ nutrient: "sodium_mg", limit: 667, value: null, status: "unknown", provenance: null, confidence: null }],
      confidence: null,
    };
    render(<ul><DishRow match={excluded} /></ul>);
    expect(screen.getByText("Not enough nutrient data")).toBeInTheDocument();
    expect(screen.getByText(/Sodium unknown of 667 mg per meal/)).toBeInTheDocument();
  });
});
