import type { CouponListResponse } from "@ail/shared";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CouponsDemoPage } from "@/pages/CouponsDemoPage";

const base = { venueAddress: "#01-03, SMU Connexion" };
const response: CouponListResponse = {
  demo: true,
  coupons: [
    { ...base, venueName: "Pasta Express", dishNames: [], coupon: { id: "c-valid", venueId: "v1", code: "DEMO-PASTA10", description: "10% off any pasta (demo offer)", validUntil: "2999-12-31", dishIds: [] } },
    { ...base, venueName: "Prince Noodles", dishNames: ["Dry noodles"], coupon: { id: "c-dish", venueId: "v2", code: "DEMO-NOODLE1", description: "$1 off the dry noodles (demo offer)", validUntil: null, dishIds: ["d1"] } },
    { ...base, venueName: "Selesa Enak Chicken Rice", dishNames: [], coupon: { id: "c-old", venueId: "v3", code: "DEMO-EXPIRED", description: "Free soup (demo offer)", validUntil: "2000-01-01", dishIds: [] } },
  ],
};

function mockFetch(body: unknown, status = 200) {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status })));
}

const card = (venue: string) => screen.getByText(venue).closest("[data-slot=card]") as HTMLElement;

describe("CouponsDemoPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("says loudly that the coupons are a demo and labels every one", async () => {
    mockFetch(response);
    render(<CouponsDemoPage />);
    expect(await screen.findByText("Pasta Express")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/Demo only/);
    expect(screen.getAllByText("Demo")).toHaveLength(3);
  });

  it("shows whether a coupon is venue-wide or limited to a dish, and its validity", async () => {
    mockFetch(response);
    render(<CouponsDemoPage />);
    await screen.findByText("Pasta Express");
    expect(within(card("Pasta Express")).getByText("Any dish at this venue")).toBeInTheDocument();
    expect(within(card("Prince Noodles")).getByText("Only on: Dry noodles")).toBeInTheDocument();
    expect(within(card("Prince Noodles")).getByText("No expiry date")).toBeInTheDocument();
  });

  it("will not open an expired coupon", async () => {
    mockFetch(response);
    render(<CouponsDemoPage />);
    await screen.findByText("Pasta Express");
    const expired = card("Selesa Enak Chicken Rice");
    expect(within(expired).getByText("Expired")).toBeInTheDocument();
    expect(within(expired).getByRole("button", { name: "Show at counter" })).toBeDisabled();
  });

  it("opens the counter screen with a big code, a QR code and a demo warning", async () => {
    mockFetch(response);
    render(<CouponsDemoPage />);
    await screen.findByText("Pasta Express");
    fireEvent.click(within(card("Pasta Express")).getByRole("button", { name: "Show at counter" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText("Coupon code")).toHaveTextContent("DEMO-PASTA10");
    expect(dialog.querySelector("svg")).not.toBeNull();
    expect(within(dialog).getByRole("note")).toHaveTextContent(/staff will not honour this/);
  });

  it("marks a coupon as used, keeps that after a reload, and can reset", async () => {
    mockFetch(response);
    const first = render(<CouponsDemoPage />);
    await screen.findByText("Pasta Express");
    fireEvent.click(within(card("Pasta Express")).getByRole("button", { name: "Show at counter" }));
    fireEvent.click(await within(await screen.findByRole("dialog")).findByRole("button", { name: "Mark as used" }));

    await waitFor(() => expect(within(card("Pasta Express")).getByText("Marked used")).toBeInTheDocument());
    expect(within(card("Pasta Express")).getByRole("button", { name: "Show at counter" })).toBeDisabled();

    first.unmount();
    render(<CouponsDemoPage />);
    await screen.findByText("Pasta Express");
    expect(within(card("Pasta Express")).getByText("Marked used")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset demo" }));
    await waitFor(() => expect(screen.queryByText("Marked used")).not.toBeInTheDocument());
    expect(localStorage.getItem("ail.demoCouponsUsed.v1")).toBeNull();
  });

  it("discards an unreadable saved state instead of crashing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    localStorage.setItem("ail.demoCouponsUsed.v1", JSON.stringify({ not: "a list" }));
    mockFetch(response);
    render(<CouponsDemoPage />);
    await screen.findByText("Pasta Express");
    expect(screen.queryByText("Marked used")).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalled();
  });

  it("shows the server's error when coupons cannot be loaded", async () => {
    mockFetch({ error: "internal_error" }, 500);
    render(<CouponsDemoPage />);
    expect(await screen.findByText(/Could not load demo coupons \(500\)/)).toBeInTheDocument();
  });

  it("refuses to present coupons the server did not mark as demo", async () => {
    mockFetch({ ...response, demo: false });
    render(<CouponsDemoPage />);
    expect(await screen.findByText(/not marked as demo/)).toBeInTheDocument();
  });

  it("never uses the word safe", async () => {
    mockFetch(response);
    const { container } = render(<CouponsDemoPage />);
    await screen.findByText("Pasta Express");
    expect(container.textContent?.toLowerCase()).not.toContain("safe");
  });
});
