import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { jsonNoStore, setCsrfCookie } from "@/modules/auth/session-security";

const PRE_LOGIN_CSRF_TTL_SECONDS = 10 * 60;

export function GET(request: NextRequest) {
  const csrfToken = randomUUID();
  const response = jsonNoStore({ ok: true, csrfToken });
  setCsrfCookie(response, request, csrfToken, PRE_LOGIN_CSRF_TTL_SECONDS);
  return response;
}
