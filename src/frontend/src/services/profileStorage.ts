import { Profile } from "@ail/shared";

const KEY = "ail.profile.v1";

/** The profile never leaves the browser except inside each match request. */
export function loadProfile(storage: Storage = localStorage): Profile | null {
  const raw = storage.getItem(KEY);
  if (raw === null) return null;
  const parsed = Profile.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    storage.removeItem(KEY);
    console.warn("Stored profile was invalid and has been cleared", parsed.error.issues);
    return null;
  }
  return parsed.data;
}

export function saveProfile(profile: Profile, storage: Storage = localStorage): void {
  storage.setItem(KEY, JSON.stringify(profile));
}

export function clearProfile(storage: Storage = localStorage): void {
  storage.removeItem(KEY);
}
