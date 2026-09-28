"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button, Card, SelectField, SimulatedFormNotice } from "@/shared/components";
import type { BloqueHorarioVista, Especialidad, Medico } from "@/shared/types/catalogo-medico";
import { patientAppointmentSchema, type PatientAppointmentFormValues } from "../schemas";

export function PatientAppointmentForm({
  specialties,
  professionals,
  selectedSpecialtyId,
  selectedProfessionalId,
  slots,
}: {
  specialties: Especialidad[];
  professionals: Medico[];
  selectedSpecialtyId: string;
  selectedProfessionalId: string;
  slots: BloqueHorarioVista[];
}) {
  const router = useRouter();
  const [specialtyId, setSpecialtyId] = useState(selectedSpecialtyId);
  const [professionalId, setProfessionalId] = useState(selectedProfessionalId);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [message, setMessage] = useState("");
  const { clearErrors, register, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = useForm<PatientAppointmentFormValues>({
    resolver: zodResolver(patientAppointmentSchema),
    defaultValues: { specialtyId: selectedSpecialtyId, professionalId: selectedProfessionalId, slotId: "" },
  });
  const filteredProfessionals = useMemo(
    () => professionals.filter((professional) => professional.specialtyId === specialtyId),
    [professionals, specialtyId],
  );
  const visibleSlots = professionalId === selectedProfessionalId ? slots : [];
  function selectSpecialty(nextSpecialtyId: string) {
    setSpecialtyId(nextSpecialtyId);
    const nextProfessional = professionals.find((professional) => professional.specialtyId === nextSpecialtyId);
    setSelectedSlotId("");
    setProfessionalId(nextProfessional?.id ?? "");
    setMessage("");
    clearErrors();
    setValue("specialtyId", nextSpecialtyId, { shouldValidate: false });
    setValue("slotId", "", { shouldValidate: false });
    setValue("professionalId", nextProfessional?.id ?? "", { shouldValidate: false });
    const query = nextProfessional
      ? `especialidadId=${encodeURIComponent(nextSpecialtyId)}&medicoId=${encodeURIComponent(nextProfessional.id)}`
      : `especialidadId=${encodeURIComponent(nextSpecialtyId)}`;
    router.push(`/paciente/citas/nueva?${query}`);
  }

  function selectProfessional(nextProfessionalId: string) {
    setProfessionalId(nextProfessionalId);
    setValue("professionalId", nextProfessionalId);
    setValue("slotId", "", { shouldValidate: false });
    setSelectedSlotId("");
    setMessage("");
    clearErrors();
    const professional = professionals.find((item) => item.id === nextProfessionalId);
    const nextSpecialtyId = professional?.specialtyId ?? specialtyId;
    setValue("specialtyId", nextSpecialtyId, { shouldValidate: false });
    setSpecialtyId(nextSpecialtyId);
    router.push(`/paciente/citas/nueva?especialidadId=${encodeURIComponent(nextSpecialtyId)}&medicoId=${encodeURIComponent(nextProfessionalId)}`);
  }

  async function onSubmit(values: PatientAppointmentFormValues) {
    const professional = filteredProfessionals.find((item) => item.id === values.professionalId);
    const professionalIsVisible = professional?.specialtyId === specialtyId && professional.id === selectedProfessionalId;
    const slotIsVisible = values.slotId === selectedSlotId && visibleSlots.some((slot) => slot.id === values.slotId);
    if (!professionalIsVisible) {
      setError("professionalId", { type: "validate", message: "Selecciona un profesional visible para esta especialidad." });
      return;
    }
    if (!slotIsVisible) {
      setError("slotId", { type: "validate", message: "Selecciona un horario visible para este profesional." });
      return;
    }
    const slot = visibleSlots.find((item) => item.id === values.slotId);
    const csrf = document.cookie.split("; ").find((item) => item.startsWith("clinica_serena_csrf="))?.split("=")[1];
    if (!slot || !csrf) {
      setMessage("Tu sesión no está disponible. Inicia sesión nuevamente para confirmar una cita.");
      return;
    }
    try {
      const response = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": decodeURIComponent(csrf) },
        body: JSON.stringify({ practitionerId: values.professionalId, specialtyId: values.specialtyId, scheduledAt: slot.startAt }),
      });
      if (response.status === 401) { router.replace("/iniciar-sesion"); return; }
      if (response.status === 201) { router.replace("/paciente/citas?created=1"); router.refresh(); return; }
      setMessage(response.status === 409 ? "Ese horario ya no está disponible. Elige otro." : "No pudimos confirmar la cita. Inténtalo más tarde.");
    } catch { setMessage("No pudimos conectar con el servicio para confirmar la cita."); }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <Card className="space-y-5">
        <SelectField error={errors.specialtyId?.message} id="patient-specialty" label="Especialidad" value={specialtyId} onChange={(event) => selectSpecialty(event.target.value)}>
          <option value="">Selecciona una especialidad</option>
          {specialties.map((specialty) => <option key={specialty.id} value={specialty.id}>{specialty.name}</option>)}
        </SelectField>
        <SelectField error={errors.professionalId?.message} helperText="Profesionales cargados desde el catálogo público real." label="Profesional" {...register("professionalId", { onChange: (event) => selectProfessional(event.target.value) })}>
          <option value="">Selecciona un profesional</option>
          {filteredProfessionals.map((professional) => <option key={professional.id} value={professional.id}>{professional.fullName}{professional.specialtyName ? ` — ${professional.specialtyName}` : ""}</option>)}
        </SelectField>
      </Card>
      <Card>
        <h2 className="text-xl font-bold text-[#62727B]">Horarios disponibles</h2>
        <p className="mt-2 text-sm text-[#62727B]/75">Datos consultados del backend y mostrados en hora de Guatemala.</p>
        {visibleSlots.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {visibleSlots.map((slot) => {
              const selected = selectedSlotId === slot.id;
              return <button aria-pressed={selected} className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${selected ? "border-[#62727B] bg-[#DDF3F1]" : "border-[#62727B]/20 bg-[#FBFCFA] hover:bg-[#F8EDD2]"}`} key={slot.id} onClick={() => { setSelectedSlotId(slot.id); setValue("slotId", slot.id); setMessage(""); }} type="button"><span className="block">{slot.fecha}</span><span className="mt-1 block text-lg">{slot.horaInicio} – {slot.horaFin}</span></button>;
            })}
          </div>
        ) : <p className="mt-5 rounded-md bg-[#F8EDD2] px-4 py-3 text-sm font-semibold">No hay horarios disponibles para este profesional.</p>}
        {errors.slotId ? <p className="mt-3 rounded-md bg-[#F8E2E8] px-3 py-2 text-sm" role="alert">{errors.slotId.message}</p> : null}
      </Card>
      <div className="flex flex-col items-start gap-3">
        <Button disabled={isSubmitting || visibleSlots.length === 0} type="submit">{isSubmitting ? "Confirmando…" : "Confirmar cita"}</Button>
        <p className="rounded-md bg-[#DDF3F1] px-4 py-3 text-sm text-[#62727B]">La cita se confirma solo cuando el backend la persiste para tu sesión verificada.</p>
        {message ? <SimulatedFormNotice>{message}</SimulatedFormNotice> : null}
      </div>
    </form>
  );
}
