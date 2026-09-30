"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { getCsrfToken } from "@/modules/auth/csrf-client";
import { consultationSchema, type ConsultationFormValues } from "@/modules/expedientes/schemas";
import { PrescriptionFields } from "@/modules/recetas/components/PrescriptionForm";
import { Button, TextareaField, buttonLinkClasses } from "@/shared/components";

type SaveState =
  | { kind: "editing" }
  | { kind: "confirming"; values: ConsultationFormValues }
  | { kind: "saved" }
  | { kind: "error"; message: string; expired?: boolean };

const errorMessages: Record<string, string> = {
  ATTENTION_ALREADY_RECORDED: "La cita ya tiene una atención registrada. Se muestra el registro guardado.",
  APPOINTMENT_NOT_DOCUMENTABLE: "La cita ya no admite registrar una atención.",
  APPOINTMENT_NOT_STARTED: "La hora programada de la cita aún no comienza. Los datos no se guardaron.",
  ARRIVAL_NOT_REGISTERED: "Recepción aún no registra la llegada del paciente. Los datos no se guardaron.",
  PRACTITIONER_LINK_REQUIRED: "Tu cuenta médica aún no está vinculada a un profesional.",
  APPOINTMENT_NOT_FOUND: "La cita no existe o no está asignada a tu agenda.",
  PATIENT_RECORD_UNAVAILABLE: "La cita no está asociada a un paciente registrado.",
};

function describeFailure(status: number, body: { code?: unknown; reason?: unknown } | null) {
  if (typeof body?.code === "string" && errorMessages[body.code]) return errorMessages[body.code];
  if (status === 400) return "El servicio rechazó los datos. Revisa los campos obligatorios y la longitud del texto.";
  if (status === 401) return "Tu sesión de personal expiró o fue cerrada. Los datos no se guardaron.";
  if (status === 403) return "Tu sesión no tiene permiso para registrar atenciones.";
  return "No se pudo conectar con el servicio. Los datos no se guardaron; intenta nuevamente.";
}

/** Registra la atención, el diagnóstico y la receta de una cita propia del profesional. */
export function ConsultationForm({ appointmentId, patientName }: { appointmentId: string; patientName: string }) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>({ kind: "editing" });
  const [busy, setBusy] = useState(false);
  const { control, register, handleSubmit, formState: { errors } } = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: { reason: "", findings: "", diagnosis: "", treatmentPlan: "", prescription: [] },
  });

  async function save(values: ConsultationFormValues) {
    setBusy(true);
    try {
      const token = await getCsrfToken();
      const response = await fetch(`/api/staff/medico/citas/${encodeURIComponent(appointmentId)}/atencion`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", "x-csrf-token": token },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setState({ kind: "saved" });
        router.refresh();
        return;
      }
      const body = await response.json().catch(() => null) as { code?: unknown; reason?: unknown } | null;
      setState({ kind: "error", message: describeFailure(response.status, body), expired: response.status === 401 });
      if (body?.code === "ATTENTION_ALREADY_RECORDED") router.refresh();
    } catch {
      setState({ kind: "error", message: describeFailure(0, null) });
    } finally {
      setBusy(false);
    }
  }

  if (state.kind === "saved") {
    return (
      <div className="space-y-4" role="status">
        <p className="rounded-md bg-[#E5F1D8] px-4 py-3 text-sm font-semibold text-[#62727B]">
          Atención guardada en el expediente de {patientName}. La cita quedó completada.
        </p>
        <Link className={buttonLinkClasses} href="/medico/agenda">Volver a mi agenda</Link>
      </div>
    );
  }

  const confirming = state.kind === "confirming";

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit((values) => setState({ kind: "confirming", values }))}>
      <fieldset className="grid gap-5" disabled={confirming || busy}>
        <TextareaField error={errors.reason?.message} id="reason" label="Motivo de consulta" rows={3} {...register("reason")} />
        <TextareaField error={errors.findings?.message} id="findings" label="Hallazgos y exploración (opcional)" rows={3} {...register("findings")} />
        <TextareaField error={errors.diagnosis?.message} id="diagnosis" label="Diagnóstico" rows={3} {...register("diagnosis")} />
        <TextareaField error={errors.treatmentPlan?.message} id="treatmentPlan" label="Plan e indicaciones (opcional)" rows={3} {...register("treatmentPlan")} />
      </fieldset>
      <PrescriptionFields control={control} disabled={confirming || busy} errors={errors} register={register} />
      {state.kind === "error" ? (
        <div className="space-y-2 rounded-md bg-[#F8E2E8] px-4 py-3 text-sm" role="alert">
          <p>{state.message}</p>
          {state.expired ? <Link className="font-bold underline-offset-4 hover:underline" href="/iniciar-sesion?next=/medico&sesion=expirada">Iniciar sesión nuevamente</Link> : null}
        </div>
      ) : null}
      {confirming ? (
        <div className="space-y-3 rounded-lg border border-[#62727B]/20 bg-[#F8EDD2] p-4" role="alertdialog" aria-labelledby="confirm-title">
          <p className="font-bold" id="confirm-title">¿Guardar la atención de {patientName}?</p>
          <p className="text-sm">
            Se registrará con tu autoría y la fecha actual, y la cita quedará completada. El registro no podrá modificarse después.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void save(state.values)}>{busy ? "Guardando…" : "Confirmar y guardar"}</Button>
            <Button disabled={busy} onClick={() => setState({ kind: "editing" })} variant="ghost">Seguir editando</Button>
          </div>
        </div>
      ) : (
        <div><Button type="submit">Revisar atención</Button></div>
      )}
    </form>
  );
}
