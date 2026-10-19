import { staffAccountsSchema, summarizeStaffAccounts } from "@/modules/atencion-medica/schemas";
import { staffBackendFetch } from "@/modules/auth/staff-session";
import { jsonNoStore } from "@/modules/auth/session-security";

export async function GET() {
  const response = await staffBackendFetch("/staff/accounts");
  if (!response) return jsonNoStore({ ok: false, reason: "service" }, { status: 503 });
  if (!response.ok) return jsonNoStore({ ok: false, reason: response.status === 401 ? "expired" : "forbidden" }, { status: response.status });
  const parsed = staffAccountsSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) return jsonNoStore({ ok: false, reason: "service" }, { status: 502 });
  return jsonNoStore(summarizeStaffAccounts(parsed.data));
}
