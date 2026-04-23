import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClientInfo } from "./lib/clientInfo";
import { createClient as createSupabaseMiddlewareClient } from "./utils/supabase/middleware";

const userInfoTable = process.env.SUPABASE_USER_INFO_TABLE || "user_info_logs";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isStaticAsset =
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico";

  if (isStaticAsset) {
    return NextResponse.next();
  }

  const info = getClientInfo(request);
  const { supabase, supabaseResponse } =
    createSupabaseMiddlewareClient(request);

  // Keeps Supabase auth cookies fresh for SSR flows.
  await supabase.auth.getUser();

  const basePayload = {
    pathname,
    ip: info.ip,
    ip_v4: info.ipV4,
    ip_v6: info.ipV6,
    user_agent_raw: info.userAgentRaw,
    browser_name: info.browser.name,
    browser_version: info.browser.version,
    os_name: info.os.name,
    os_version: info.os.version,
    device_type: info.device.type,
    device_model: info.device.model,
    device_vendor: info.device.vendor,
    engine_name: info.engine.name,
    engine_version: info.engine.version,
    cpu_architecture: info.cpu.architecture,
    platform: info.platform,
    is_bot: info.isBot,
    language: info.language,
    geo_country: info.geo?.country,
    geo_region: info.geo?.region,
    geo_city: info.geo?.city,
    geo_timezone: info.geo?.timezone,
    geo_latitude: info.geo?.latitude,
    geo_longitude: info.geo?.longitude,
    captured_at: new Date().toISOString(),
  };

  let { error } = await supabase.from(userInfoTable).insert(basePayload);

  if (error?.message.includes("ip_v4") || error?.message.includes("ip_v6")) {
    const fallbackPayload = {
      pathname: basePayload.pathname,
      ip: basePayload.ip,
      user_agent_raw: basePayload.user_agent_raw,
      browser_name: basePayload.browser_name,
      browser_version: basePayload.browser_version,
      os_name: basePayload.os_name,
      os_version: basePayload.os_version,
      device_type: basePayload.device_type,
      device_model: basePayload.device_model,
      device_vendor: basePayload.device_vendor,
      engine_name: basePayload.engine_name,
      engine_version: basePayload.engine_version,
      cpu_architecture: basePayload.cpu_architecture,
      platform: basePayload.platform,
      is_bot: basePayload.is_bot,
      language: basePayload.language,
      geo_country: basePayload.geo_country,
      geo_region: basePayload.geo_region,
      geo_city: basePayload.geo_city,
      geo_timezone: basePayload.geo_timezone,
      geo_latitude: basePayload.geo_latitude,
      geo_longitude: basePayload.geo_longitude,
      captured_at: basePayload.captured_at,
    };
    ({ error } = await supabase.from(userInfoTable).insert(fallbackPayload));
  }

  if (error) {
    console.error("[middleware] failed to persist user info", error.message);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-client-ip", info.ip);
  requestHeaders.set(
    "x-client-browser",
    `${info.browser.name}/${info.browser.version}`,
  );
  requestHeaders.set("x-client-os", `${info.os.name}/${info.os.version}`);
  requestHeaders.set("x-client-device", info.device.type);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-client-device", info.device.type);
  response.headers.set("x-client-os", `${info.os.name}/${info.os.version}`);
  response.headers.set("x-middleware-hit", Date.now().toString());

  for (const cookie of supabaseResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
