import { backendFetch } from "@/modules/auth/server-session";
import { isSafeIdentifier } from "@/modules/auth/staff-proxy";

export async function GET(_request: Request, context: { params: Promise<{ medicoId: string }> }) {
  const { medicoId } = await context.params;
  if (!isSafeIdentifier(medicoId)) return new Response(null, { status: 404 });
  const response = await backendFetch(`/medicos/${encodeURIComponent(medicoId)}/foto`);
  if (!response?.ok) return new Response(null, { status: response?.status ?? 503, headers: { "Cache-Control": "no-store" } });
  return new Response(response.body, { status: 200, headers: {
    "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
    "Cache-Control": response.headers.get("cache-control") ?? "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  }});
}
