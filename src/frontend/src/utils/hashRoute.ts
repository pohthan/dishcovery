import { useEffect, useState } from "react";

export type Route = "home" | "coupons-demo";

const COUPONS_DEMO_HASH = "#/coupons-demo";

export function parseRoute(hash: string): Route {
  return hash === COUPONS_DEMO_HASH ? "coupons-demo" : "home";
}

export function goTo(route: Route): void {
  window.location.hash = route === "coupons-demo" ? COUPONS_DEMO_HASH : "";
}

/** The current page, following the URL hash so the demo page can be linked to directly. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
