import "server-only";

import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PATIENT_CSRF_COOKIE, PATIENT_SESSION_COOKIE } from "@/modules/auth/server-session";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

function firstForwardedValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim().toLowerCase() ?? null;
}

export function isSecureRequest(request: NextRequest) {
  return request.nextUrl.protocol === "https:" || firstForwardedValue(request.headers.get("x-forwarded-proto")) === "https";
}

export function hasSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const protocol = firstForwardedValue(request.headers.get("x-forwarded-proto")) ?? request.nextUrl.protocol.replace(":", "");
  const host = firstForwardedValue(request.headers.get("x-forwarded-host")) ?? request.headers.get("host") ?? request.nextUrl.host;

  try {
    return new URL(origin).origin === new URL(`${protocol}://${host}`).origin;
  } catch {
    return false;
  }
}

export function hasValidCsrf(request: NextRequest) {
  if (!hasSameOrigin(request)) return false;
  const cookieToken = request.cookies.get(PATIENT_CSRF_COOKIE)?.value;
  const headerToken = request.headers.get("x-csrf-token");
  if (!cookieToken || !headerToken) return false;

  const cookieBytes = Buffer.from(cookieToken);
  const headerBytes = Buffer.from(headerToken);
  return cookieBytes.length === headerBytes.length && timingSafeEqual(cookieBytes, headerBytes);
}

function cookieOptions(request: NextRequest, maxAge: number) {
  return {
    maxAge,
    path: "/",
    priority: "high" as const,
    sameSite: "lax" as const,
    secure: isSecureRequest(request),
  };
}

export function setCsrfCookie(response: NextResponse, request: NextRequest, token: string, maxAge: number) {
  response.cookies.set(PATIENT_CSRF_COOKIE, token, {
    ...cookieOptions(request, maxAge),
    httpOnly: false,
  });
}

export function setPatientSessionCookies(
  response: NextResponse,
  request: NextRequest,
  sessionToken: string,
  csrfToken: string,
  maxAge: number,
) {
  response.cookies.set(PATIENT_SESSION_COOKIE, sessionToken, {
    ...cookieOptions(request, maxAge),
    httpOnly: true,
  });
  setCsrfCookie(response, request, csrfToken, maxAge);
}

export function clearPatientSessionCookies(response: NextResponse, request: NextRequest) {
  response.cookies.set(PATIENT_SESSION_COOKIE, "", {
    ...cookieOptions(request, 0),
    httpOnly: true,
  });
  response.cookies.set(PATIENT_CSRF_COOKIE, "", {
    ...cookieOptions(request, 0),
    httpOnly: false,
  });
}

export function jsonNoStore(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", NO_STORE_HEADERS["Cache-Control"]);
  return NextResponse.json(body, { ...init, headers });
}
