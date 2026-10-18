import type { CouponListResponse, MatchResponse, Profile, VenueMatch } from "@ail/shared";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResultsPage } from "@/pages/ResultsPage";

// Leaflet needs real layout. This stand-in lets a test "click a marker" for each venue.
vi.mock("@/components/MapView", () => ({
  MapView: ({ venues, onSelect }: { venues: VenueMatch[]; onSelect: (id: string) => void }) => (
    <div>
      {venues.map((v) => (
        <button key={v.venue.id} type="button" onClick={() => onSelect(v.venue.id)}>
          marker {v.venue.id}
        </button>
      ))}
    </div>
  ),
}));

const profile: Profile = { conditions: [], sodiumPreset: null, limits: {}, halalOnly: false, vegetarianOnly: false };

const venueMatch = (id: string, name: string): VenueMatch => ({
  venue: {
    id, name, kind: "food_centre_stall", address: "#01", lat: 1.29, lng: 103.85,
    halal: { status: "unverified", checkedOn: null, certificateNo: null }, menuNote: null, vegetarianOptions: null,
  },
  distanceMetres: 50, matchedCount: 0, totalCount: 0, dishes: [],
});
const match: MatchResponse = { venues: [venueMatch("v1", "Pasta Express"), venueMatch("v2", "King Kong Curry")], closest: [], inactiveRules: [] };

const coupons: CouponListResponse = {
  demo: true,
  coupons: [{
    venueName: "Pasta Express", venueAddress: "#01-03",
    dishNames: [],
    coupon: { id: "c1", venueId: "v1", code: "DEMO-PASTA10", description: "10% off any pasta (demo offer)", validUntil: "2999-12-31", dishIds: [] },
  }],
};

function mockServer(demo: "on" | "off" | "broken") {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url === "/api/match") return new Response(JSON.stringify(match));
    if (demo === "off") return new Response("{}", { status: 404 });
    if (demo === "broken") return new Response("{}", { status: 500 });
    return new Response(JSON.stringify(coupons));
  }));
}

const loaded = async () => {
  render(<ResultsPage profile={profile} onEdit={() => undefined} />);
  await screen.findByText("marker v1");
};

describe("choosing a place launches its demo coupons", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("opens the coupons when a place with demo coupons is chosen on the map", async () => {
    mockServer("on");
    await loaded();
    await waitFor(() => expect(screen.getByRole("button", { name: /Demo coupons \(1\)/ })).toBeInTheDocument());
    fireEvent.click(screen.getByText("marker v1"));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Demo coupons at Pasta Express/)).toBeInTheDocument();
    expect(within(dialog).getByText("10% off any pasta (demo offer)")).toBeInTheDocument();
  });

  it("also opens them when the place's card is chosen", async () => {
    mockServer("on");
    await loaded();
    await waitFor(() => screen.getByRole("button", { name: /Demo coupons \(1\)/ }));
    fireEvent.click(screen.getByText("Pasta Express", { selector: "[data-slot=card-title]" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("opens nothing for a place without demo coupons", async () => {
    mockServer("on");
    await loaded();
    await waitFor(() => screen.getByRole("button", { name: /Demo coupons \(1\)/ }));
    fireEvent.click(screen.getByText("marker v2"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not pop up again for the same place, but the card button reopens it", async () => {
    mockServer("on");
    await loaded();
    await waitFor(() => screen.getByRole("button", { name: /Demo coupons \(1\)/ }));
    fireEvent.click(screen.getByText("marker v1"));
    await screen.findByRole("dialog");
    fireEvent.keyDown(document.body, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    fireEvent.click(screen.getByText("marker v1"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Demo coupons \(1\)/ }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("leads on to the counter screen with the code and a demo warning", async () => {
    mockServer("on");
    await loaded();
    await waitFor(() => screen.getByRole("button", { name: /Demo coupons \(1\)/ }));
    fireEvent.click(screen.getByText("marker v1"));
    fireEvent.click(await within(await screen.findByRole("dialog")).findByRole("button", { name: "Show at counter" }));
    await waitFor(() => expect(screen.getByLabelText("Coupon code")).toHaveTextContent("DEMO-PASTA10"));
    expect(screen.getByRole("note")).toHaveTextContent(/staff will not honour this/);
  });

  it("shows nothing coupon-related, and still shows results, when the server has demo coupons off", async () => {
    mockServer("off");
    await loaded();
    fireEvent.click(screen.getByText("marker v1"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Demo coupons \(/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/could not be loaded/)).not.toBeInTheDocument();
    expect(screen.getByText("King Kong Curry", { selector: "[data-slot=card-title]" })).toBeInTheDocument();
  });

  it("says so, and still shows results, when demo coupons fail to load", async () => {
    mockServer("broken");
    await loaded();
    expect(await screen.findByText(/Demo coupons could not be loaded/)).toBeInTheDocument();
    expect(screen.getByText("King Kong Curry", { selector: "[data-slot=card-title]" })).toBeInTheDocument();
  });
});
