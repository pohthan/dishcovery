import type { ClosestMatch, DishMatch, VenueMatch } from "@ail/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClosestPanel } from "@/components/ClosestPanel";

const venueBase = {
  id: "v1",
  name: "Pasta Express",
  kind: "food_centre_stall" as const,
  address: "#01-03",
  lat: 1.29,
  lng: 103.85,
  halal: { status: "unverified" as const, checkedOn: null, certificateNo: null },
  menuNote: null,
  vegetarianOptions: null,
};

function dishMatch(id: string, name: string, over: { amount: number; ratio: number } | null): DishMatch {
  return {
    dish: { id, venueId: "v1", name, priceSgd: null, servingGrams: 300, nutrients: {}, vegetarian: null, menuSource: "third_party" },
    matches: false,
    checks: [],
    reasons: ["exceeds_limit"],
    overBy: over ? [{ nutrient: "sodium_mg", ...over }] : [],
    overLimitRatio: over?.ratio ?? null,
    confidence: "medium",
    coupons: [],
  };
}

const venues: VenueMatch[] = [
  { venue: venueBase, distanceMetres: 120, matchedCount: 0, totalCount: 1, dishes: [dishMatch("d1", "Pasta with tomato sauce", { amount: 150, ratio: 0.22 })] },
];
const closest: ClosestMatch[] = [{ venueId: "v1", dishId: "d1", overLimitRatio: 0.22 }];

describe("ClosestPanel", () => {
  it("shows the nearest dishes and exactly how far over each is when nothing fits", () => {
    render(<ClosestPanel closest={closest} venues={venues} exactCount={0} checkedCount={1} unknownCount={0} onSelect={() => undefined} />);
    expect(screen.getByText(/Nothing fits your limits exactly/)).toBeInTheDocument();
    expect(screen.getByText("Pasta with tomato sauce")).toBeInTheDocument();
    expect(screen.getByText(/Sodium 150 mg over \(about 22%\)/)).toBeInTheDocument();
    expect(screen.getByText(/120 m/)).toBeInTheDocument();
  });

  it("selects the venue when a close dish is clicked", () => {
    const onSelect = vi.fn();
    render(<ClosestPanel closest={closest} venues={venues} exactCount={0} checkedCount={1} unknownCount={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Pasta with tomato sauce"));
    expect(onSelect).toHaveBeenCalledWith("v1");
  });

  it("also offers close dishes when only a few fit exactly", () => {
    render(<ClosestPanel closest={closest} venues={venues} exactCount={2} checkedCount={3} unknownCount={0} onSelect={() => undefined} />);
    expect(screen.getByText(/Only a few dishes fit exactly/)).toBeInTheDocument();
  });

  it("stays out of the way when enough dishes fit and none are unchecked", () => {
    const { container } = render(<ClosestPanel closest={closest} venues={venues} exactCount={3} checkedCount={5} unknownCount={0} onSelect={() => undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("says plainly that no dish is close when dishes were checked but none are near", () => {
    render(<ClosestPanel closest={[]} venues={venues} exactCount={0} checkedCount={4} unknownCount={0} onSelect={() => undefined} />);
    expect(screen.getByText("No dish is close to your limits.")).toBeInTheDocument();
  });

  it("says how many dishes cannot be checked yet, and does not claim anything is close", () => {
    render(<ClosestPanel closest={[]} venues={venues} exactCount={0} checkedCount={0} unknownCount={13} onSelect={() => undefined} />);
    expect(screen.getByText(/13 dishes cannot be checked yet/)).toBeInTheDocument();
    expect(screen.queryByText(/Closest options/)).not.toBeInTheDocument();
    expect(screen.queryByText(/No dish is close/)).not.toBeInTheDocument();
  });

  it("uses the singular for one unchecked dish and never says safe", () => {
    const { container } = render(<ClosestPanel closest={closest} venues={venues} exactCount={0} checkedCount={1} unknownCount={1} onSelect={() => undefined} />);
    expect(screen.getByText(/1 dish cannot be checked yet/)).toBeInTheDocument();
    expect(container.textContent?.toLowerCase()).not.toContain("safe");
  });
});
