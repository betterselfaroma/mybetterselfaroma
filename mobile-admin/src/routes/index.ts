export type RouteKey = "dashboard" | "bookings" | "scan" | "members" | "points" | "rewards" | "settings";

const ROUTE_MAP: Record<string, RouteKey> = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/bookings": "bookings",
  "/scan": "scan",
  "/members": "members",
  "/points": "points",
  "/rewards": "rewards",
  "/settings": "settings",
};

export function parseRoute() {
  const rawHash = window.location.hash.replace(/^#/, "");
  const [path = "/", query = ""] = rawHash.split("?");
  const route = ROUTE_MAP[path] ?? "dashboard";
  return { route, params: new URLSearchParams(query) };
}

export function routeToHash(route: RouteKey, params?: URLSearchParams) {
  const query = params?.toString();
  return `#/${route === "dashboard" ? "dashboard" : route}${query ? `?${query}` : ""}`;
}
