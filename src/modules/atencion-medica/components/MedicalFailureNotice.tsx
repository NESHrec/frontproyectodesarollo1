import Link from "next/link";

import type { MedicalFailure } from "@/modules/atencion-medica/server";
import { ApiErrorState, Card, buttonLinkClasses } from "@/shared/components";

const messages: Record<Exclude<MedicalFailure, "service">, { title: string; description: string }> = {
  expired: {
    title: "Tu sesión terminó",
    description: "Inicia sesión nuevamente con tu cuenta de personal para continuar.",
  },
  unlinked: {
    title: "Cuenta médica pendiente de vinculación",
    description: "Un administrador debe asignar tu cuenta a un profesional del catálogo antes de que puedas consultar citas o datos clínicos.",
  },
  forbidden: {
    title: "Acceso denegado",
    description: "Tu sesión no tiene permiso para consultar información clínica.",
  },
  "not-found": {
    title: "Cita no disponible",
    description: "La cita no existe o no está asignada a tu agenda.",
  },
  unavailable: {
    title: "Expediente no disponible",
    description: "La cita no está asociada a un paciente registrado, por lo que no puede abrirse un expediente.",
  },
};

export function MedicalFailureNotice({ reason }: { reason: MedicalFailure }) {
  if (reason === "service") {
    return <ApiErrorState description="El servicio clínico no respondió. Ningún dato se guardó ni se muestra desde caché." title="No pudimos consultar el backend" />;
  }
  const message = messages[reason];
  return (
    <Card className="bg-[#F8E2E8]" role="alert">
      <h2 className="text-lg font-bold text-[#62727B]">{message.title}</h2>
      <p className="mt-2 text-sm leading-6">{message.description}</p>
      <div className="mt-4">
        {reason === "expired"
          ? <Link className={buttonLinkClasses} href="/iniciar-sesion?next=/medico">Iniciar sesión</Link>
          : <Link className={buttonLinkClasses} href="/medico/agenda">Volver a mi agenda</Link>}
      </div>
    </Card>
  );
}
