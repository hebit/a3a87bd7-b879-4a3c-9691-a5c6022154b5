import { NextResponse, type NextRequest } from "next/server";
import { getClientInfo } from "../../../lib/clientInfo";
import { getGeoInfo } from "../../../lib/geoInfo";

export async function GET(request: NextRequest) {
  const info = getClientInfo(request);

  // Enrich with offline geoip-lite when edge geo is unavailable (local/unknown)
  const edgeGeoMissing = !info.geo || info.geo.country === "unknown";
  if (edgeGeoMissing) {
    const geoLite = getGeoInfo(info.ip);
    info.geo = geoLite;
  }

  return NextResponse.json({
    ok: true,
    data: info,
    timestamp: new Date().toISOString(),
  });
}
