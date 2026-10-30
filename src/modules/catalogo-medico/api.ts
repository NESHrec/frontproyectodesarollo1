import { apiGet, type ApiResult } from "@/shared/lib/api/client";
import type { Medico } from "@/shared/types/catalogo-medico";
import {
  disponibilidadResponseSchema,
  especialidadesResponseSchema,
  medicosResponseSchema,
} from "@/modules/catalogo-medico/schemas";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type RangoFechas = {
  /** YYYY-MM-DD */
  desde?: string;
  /** YYYY-MM-DD */
  hasta?: string;
};

/** GET /especialidades */
export function getEspecialidades() {
  return apiGet("/especialidades", { schema: especialidadesResponseSchema });
}

/** GET /medicos y GET /medicos?specialtyId={id} */
export function getMedicos(specialtyId?: string) {
  return apiGet("/medicos", {
    schema: medicosResponseSchema,
    query: { specialtyId },
  });
}

/**
 * El contrato no define GET /medicos/{id}; el perfil se obtiene del listado
 * público de GET /medicos.
 */
export async function getMedicoPorId(medicoId: string): Promise<ApiResult<Medico | null>> {
  const result = await getMedicos();

  if (!result.ok) {
    return result;
  }

  return { ok: true, data: result.data.find((medico) => medico.id === medicoId) ?? null };
}

/** GET /medicos/{medicoId}/disponibilidad?desde=YYYY-MM-DD&hasta=YYYY-MM-DD */
export function getDisponibilidadMedico(medicoId: string, rango: RangoFechas = {}) {
  return apiGet(`/medicos/${encodeURIComponent(medicoId)}/disponibilidad`, {
    schema: disponibilidadResponseSchema,
    query: {
      desde: rango.desde && ISO_DATE.test(rango.desde) ? rango.desde : undefined,
      hasta: rango.hasta && ISO_DATE.test(rango.hasta) ? rango.hasta : undefined,
    },
    // Los horarios cambian con frecuencia: nunca se reutiliza una respuesta cacheada.
    cache: "no-store",
  });
}
