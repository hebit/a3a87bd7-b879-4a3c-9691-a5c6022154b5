import { userAgent, type NextRequest } from "next/server";

export type ClientInfo = {
  ip: string;
  ipV4: string;
  ipV6: string;
  userAgentRaw: string;
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: string;
    model: string;
    vendor: string;
  };
  engine: {
    name: string;
    version: string;
  };
  cpu: {
    architecture: string;
  };
  platform: string;
  isBot: boolean;
  language: string;
  geo?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
    latitude: number | null;
    longitude: number | null;
  };
};

const fallback = "unknown";

function isIPv4(value: string): boolean {
  const candidate = value.trim();
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(candidate)) {
    return false;
  }

  return candidate
    .split(".")
    .every((part) => Number(part) >= 0 && Number(part) <= 255);
}

function normalizeIp(value: string): string {
  const trimmed = value.trim();

  // x-forwarded-for may include quoted values from some proxies.
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function getClientIpCandidates(request: NextRequest): string[] {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor
      .split(",")
      .map((ip) => normalizeIp(ip))
      .filter(Boolean);
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return [normalizeIp(realIp)];
  }

  return [];
}

function extractIpFamilies(ips: string[]): {
  ip: string;
  ipV4: string;
  ipV6: string;
} {
  let ipV4 = fallback;
  let ipV6 = fallback;

  for (const rawIp of ips) {
    const ip = normalizeIp(rawIp);

    if (ip.startsWith("::ffff:")) {
      const mappedV4 = ip.slice(7);
      if (isIPv4(mappedV4)) {
        ipV4 = mappedV4;
      }
      if (ipV6 === fallback) {
        ipV6 = ip;
      }
      continue;
    }

    if (isIPv4(ip)) {
      ipV4 = ip;
      continue;
    }

    if (ip.includes(":")) {
      ipV6 = ip;
    }
  }

  const firstKnownIp = ips[0] || fallback;
  const ip = ipV4 !== fallback ? ipV4 : ipV6 !== fallback ? ipV6 : firstKnownIp;

  return { ip, ipV4, ipV6 };
}

export function getClientInfo(request: NextRequest): ClientInfo {
  const parsed = userAgent(request);
  const ipCandidates = getClientIpCandidates(request);
  const ipInfo = extractIpFamilies(ipCandidates);

  return {
    ip: ipInfo.ip,
    ipV4: ipInfo.ipV4,
    ipV6: ipInfo.ipV6,
    userAgentRaw: request.headers.get("user-agent") || fallback,
    browser: {
      name: parsed.browser.name || fallback,
      version: parsed.browser.version || fallback,
    },
    os: {
      name: parsed.os.name || fallback,
      version: parsed.os.version || fallback,
    },
    device: {
      type: parsed.device.type || "desktop",
      model: parsed.device.model || fallback,
      vendor: parsed.device.vendor || fallback,
    },
    engine: {
      name: parsed.engine.name || fallback,
      version: parsed.engine.version || fallback,
    },
    cpu: {
      architecture: parsed.cpu?.architecture || fallback,
    },
    platform: request.headers.get("sec-ch-ua-platform") || fallback,
    isBot: parsed.isBot || false,
    language: request.headers.get("accept-language") || fallback,
    geo: {
      country: request.headers.get("x-vercel-ip-country") || fallback,
      region: request.headers.get("x-vercel-ip-country-region") || fallback,
      city: request.headers.get("x-vercel-ip-city") || fallback,
      timezone: request.headers.get("x-vercel-ip-timezone") || fallback,
      latitude:
        parseFloat(request.headers.get("x-vercel-ip-latitude") ?? "") || null,
      longitude:
        parseFloat(request.headers.get("x-vercel-ip-longitude") ?? "") || null,
    },
  };
}
