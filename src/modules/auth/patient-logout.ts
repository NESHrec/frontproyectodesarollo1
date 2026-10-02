export const PATIENT_LOGOUT_TIMEOUT_MS = 8_000;

export type PatientLogoutResult =
  | { status: "success" }
  | { status: "expired" }
  | { status: "csrf" }
  | { status: "service" };

function csrfCookie() {
  return document.cookie
    .split("; ")
    .find((item) => item.startsWith("clinica_serena_csrf="))
    ?.split("=")[1];
}

export async function requestPatientLogout(
  timeoutMs = PATIENT_LOGOUT_TIMEOUT_MS,
): Promise<PatientLogoutResult> {
  const csrf = csrfCookie();

  try {
    const response = await fetch("/api/session/logout", {
      method: "POST",
      headers: { "x-csrf-token": csrf ? decodeURIComponent(csrf) : "" },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (response.ok) return { status: "success" };
    if (response.status === 401) return { status: "expired" };
    if (response.status === 403) return { status: "csrf" };
    return { status: "service" };
  } catch {
    return { status: "service" };
  }
}
