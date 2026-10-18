import type { Profile } from "@ail/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearProfile, loadProfile, saveProfile } from "@/services/profileStorage";

const profile: Profile = {
  conditions: ["ckd"],
  sodiumPreset: "ada_kdoqi_2300",
  limits: { potassium_mg: 700 },
  halalOnly: true,
  vegetarianOnly: false,
};

describe("profileStorage", () => {
  beforeEach(() => localStorage.clear());

  it("returns null when nothing is stored", () => {
    expect(loadProfile()).toBeNull();
  });

  it("round-trips a saved profile", () => {
    saveProfile(profile);
    expect(loadProfile()).toEqual(profile);
  });

  it("clears an invalid stored profile and returns null", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    localStorage.setItem("ail.profile.v1", JSON.stringify({ conditions: ["flu"] }));
    expect(loadProfile()).toBeNull();
    expect(localStorage.getItem("ail.profile.v1")).toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  it("removes the profile on clear", () => {
    saveProfile(profile);
    clearProfile();
    expect(loadProfile()).toBeNull();
  });
});
