import { useEffect, useState } from "react";
import type { MatchResponse, Profile } from "@ail/shared";
import { postMatch } from "@/services/api";
import type { Origin } from "@/utils/origins";

export type MatchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: MatchResponse };

export function useMatch(profile: Profile, origin: Origin): MatchState {
  const [state, setState] = useState<MatchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    postMatch({ profile, origin: { lat: origin.lat, lng: origin.lng } })
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch((err: Error) => !cancelled && setState({ status: "error", message: err.message }));
    return () => {
      cancelled = true;
    };
  }, [profile, origin]);

  return state;
}
