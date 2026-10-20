import "server-only";

import { timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import type { NextRequest } from "next/server";

const PROXY_AUTH_HEADER = "x-clinica-proxy-secret";

function safeEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function isTrustedProxyRequest(request: NextRequest) {
  const expected = process.env.TRUSTED_PROXY_SHARED_SECRET;
  const supplied = request.headers.get(PROXY_AUTH_HEADER);
  return typeof expected === "string" && expected.length >= 32 && typeof supplied === "string" && safeEqual(expected, supplied);
}

export function trustedForwardedValue(request: NextRequest, name: "x-forwarded-proto" | "x-forwarded-host") {
  if (!isTrustedProxyRequest(request)) return null;
  return request.headers.get(name)?.split(",", 1)[0]?.trim().toLowerCase() || null;
}

export function trustedClientAddress(request: NextRequest) {
  if (!isTrustedProxyRequest(request)) return null;
  const candidate = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  return candidate && isIP(candidate) ? candidate : null;
}
