import geoip from "geoip-lite";

export type GeoInfo = {
  country: string;
  region: string;
  city: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
};

const fallback = "unknown";

export function getGeoInfo(ip: string): GeoInfo {
  const geo = geoip.lookup(ip);

  if (!geo) {
    return {
      country: fallback,
      region: fallback,
      city: fallback,
      timezone: fallback,
      latitude: null,
      longitude: null,
    };
  }

  return {
    country: geo.country || fallback,
    region: geo.region || fallback,
    city: geo.city || fallback,
    timezone: geo.timezone || fallback,
    latitude: geo.ll?.[0] ?? null,
    longitude: geo.ll?.[1] ?? null,
  };
}
