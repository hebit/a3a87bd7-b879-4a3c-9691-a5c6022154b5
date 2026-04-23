import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getClientInfo } from "@/lib/clientInfo";
import { createClient } from "@/utils/supabase/server";

const locationTable =
  process.env.SUPABASE_LOCATION_TABLE || "location_access_logs";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type LocationConsentBody = {
  latitude?: unknown;
  longitude?: unknown;
  accuracy?: unknown;
  altitude?: unknown;
  altitudeAccuracy?: unknown;
  heading?: unknown;
  speed?: unknown;
};

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function toRequiredCoordinate(value: unknown): number | null {
  const parsed = toFiniteNumber(value);
  if (parsed === null) {
    return null;
  }

  return parsed;
}

export async function POST(request: NextRequest) {
  let body: LocationConsentBody;

  try {
    body = (await request.json()) as LocationConsentBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid JSON body",
      },
      { status: 400 },
    );
  }

  const latitude = toRequiredCoordinate(body.latitude);
  const longitude = toRequiredCoordinate(body.longitude);

  if (latitude === null || longitude === null) {
    return NextResponse.json(
      {
        ok: false,
        error: "latitude and longitude are required numbers",
      },
      { status: 400 },
    );
  }

  const info = getClientInfo(request);
  const supabase =
    supabaseUrl && supabaseServiceRoleKey
      ? createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })
      : await createClient();

  const payload = {
    latitude,
    longitude,
    accuracy: toFiniteNumber(body.accuracy),
    altitude: toFiniteNumber(body.altitude),
    altitude_accuracy: toFiniteNumber(body.altitudeAccuracy),
    heading: toFiniteNumber(body.heading),
    speed: toFiniteNumber(body.speed),
    ip: info.ip,
    ip_v4: info.ipV4,
    ip_v6: info.ipV6,
    user_agent_raw: info.userAgentRaw,
    source: "follow_restriction_modal",
    captured_at: new Date().toISOString(),
  };

  const { error } = await supabase.from(locationTable).insert(payload);

  if (error) {
    console.error("[location-consent] failed to persist location", error.message);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to persist location data",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
