import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { matchVenues } from "../app/services/matching";
import { repoDataRoot } from "../scripts/data-root";
import { loadCatalogData } from "../scripts/load-catalog";
import { buildVenues } from "../scripts/venues";
import { baseProfile } from "./fixtures";

const read = (name: string) =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../../../data/${name}`, import.meta.url)), "utf-8")) as unknown;

const muis = { checkedOn: "2026-10-07", establishments: [{ name: "X", certificateNo: "EEHK1" }] };
const centre = { id: "c", name: "Court", kind: "food_centre", address: "1 Road", lat: 1.2963, lng: 103.8503 };
const stall = (id: string, extra: object = {}) => ({ id, name: id, kind: "food_centre_stall", address: "#01", inCentre: "c", ...extra });

describe("buildVenues", () => {
  it("places stalls near their centre without stacking them", () => {
    const venues = buildVenues({ venues: [centre, stall("a"), stall("b"), stall("c2")] }, muis);
    const spots = venues.slice(1).map((v) => `${v.lat.toFixed(6)},${v.lng.toFixed(6)}`);
    expect(new Set(spots).size).toBe(3);
    for (const v of venues.slice(1)) {
      expect(Math.abs(v.lat - 1.2963)).toBeLessThan(0.0006);
      expect(Math.abs(v.lng - 103.8503)).toBeLessThan(0.0006);
    }
  });

  it("places a stall even when it is listed before its centre", () => {
    const venues = buildVenues({ venues: [stall("a"), centre] }, muis);
    expect(venues.map((v) => v.id)).toEqual(["a", "c"]);
  });

  it("verifies halal only for a stall that cites a certificate in the evidence file", () => {
    const venues = buildVenues({ venues: [centre, stall("a", { muisCertificateNo: "EEHK1" }), stall("b")] }, muis);
    expect(venues[1]!.halal).toEqual({ status: "muis_certified", checkedOn: "2026-10-07", certificateNo: "EEHK1" });
    expect(venues[2]!.halal.status).toBe("unverified");
    expect(venues[0]!.halal.status).toBe("unverified");
  });

  it("fails loudly on a bad reference or ambiguous entry", () => {
    expect(() => buildVenues({ venues: [centre, stall("a", { muisCertificateNo: "NOPE" })] }, muis)).toThrow(/not in the evidence file/);
    expect(() => buildVenues({ venues: [stall("a", { inCentre: "missing" })] }, muis)).toThrow(/unknown centre/);
    expect(() => buildVenues({ venues: [centre, centre] }, muis)).toThrow(/Duplicate/);
    expect(() => buildVenues({ venues: [{ ...centre, inCentre: "c" }] }, muis)).toThrow();
    expect(() => buildVenues({ venues: [{ id: "x", name: "x", kind: "chain", address: "a" }] }, muis)).toThrow();
  });
});

describe("SMU venue data", () => {
  it("includes the Koufu court, the Connexion court with its six outlets, and Prince Noodles", async () => {
    const { venues } = await loadCatalogData(repoDataRoot);
    const names = venues.map((v) => v.name);
    for (const n of ["Koufu (SMU Li Ka Shing Library)", "SMU Connexion Food Court", "Prince Noodles", "King Kong Curry", "Pasta Express", "Indo Express Punggol", "Ying Thai", "Supergreen", "Open Kitchen by Prata Alley"]) {
      expect(names).toContain(n);
    }
  });

  it("marks exactly the MUIS-certified stalls as halal verified", async () => {
    const { venues } = await loadCatalogData(repoDataRoot);
    const certified = venues.filter((v) => v.halal.status === "muis_certified").map((v) => v.name).sort();
    expect(certified).toEqual(["Haus Ban Mian & Fish Soup", "Indo Express Punggol", "Selesa Enak Chicken Rice"]);
    expect(venues.find((v) => v.name === "King Kong Curry")!.halal.status).toBe("unverified");
    expect(venues.find((v) => v.name === "Prince Noodles")!.halal.status).toBe("unverified");
  });

  it("does not treat Muslim-owned as certified", async () => {
    const { venues } = await loadCatalogData(repoDataRoot);
    expect(venues.find((v) => v.name === "Open Kitchen by Prata Alley")!.halal.status).toBe("unverified");
  });

  it("does not import Subway, 100AM or Koufu 100AM", async () => {
    const { venues } = await loadCatalogData(repoDataRoot);
    expect(venues.some((v) => /subway|100\s?am|tras/i.test(`${v.name} ${v.address}`))).toBe(false);
    expect(JSON.stringify(read("published/muis-halal-smu.json"))).not.toMatch(/SUBWAY|100 TRAS/);
  });

  it("keeps every venue inside the SMU and Bras Basah area", async () => {
    const { venues } = await loadCatalogData(repoDataRoot);
    for (const v of venues) {
      expect(v.lat).toBeGreaterThan(1.29);
      expect(v.lat).toBeLessThan(1.30);
      expect(v.lng).toBeGreaterThan(103.848);
      expect(v.lng).toBeLessThan(103.852);
    }
  });

  it("lets a halal-only user find the three certified stalls", async () => {
    const { venues, dishes } = await loadCatalogData(repoDataRoot);
    const res = matchVenues({ profile: { ...baseProfile, halalOnly: true }, venues, dishes, coupons: [], origin: { lat: 1.2956, lng: 103.8492 } });
    const withHalal = res.venues.filter((v) => v.venue.halal.status === "muis_certified");
    expect(withHalal).toHaveLength(3);
  });

  it("has dishes for the venues we know menus for, whatever has been uploaded since", async () => {
    const { dishes } = await loadCatalogData(repoDataRoot);
    const count = (id: string) => dishes.filter((d) => d.venueId === id).length;
    expect(count("prince-noodles-smu-law")).toBeGreaterThanOrEqual(2);
    expect(count("smu-pasta-express")).toBeGreaterThanOrEqual(3);
    expect(count("smu-indo-express-punggol")).toBeGreaterThanOrEqual(1);
    for (const id of ["smu-open-kitchen-prata-alley", "smu-supergreen", "koufu-haus-ban-mian", "koufu-selesa-enak-chicken-rice"]) {
      expect(count(id), id).toBeGreaterThanOrEqual(1);
    }
  });

});
