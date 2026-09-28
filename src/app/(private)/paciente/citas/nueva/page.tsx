import { getDisponibilidadMedico, getEspecialidades, getMedicos } from "@/modules/catalogo-medico/api";
import { ordenarBloques, toBloqueHorarioVista } from "@/modules/catalogo-medico/format";
import { ApiErrorState, EmptyState } from "@/shared/components";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";
import { PatientAppointmentForm } from "@/modules/paciente-portal/components/PatientAppointmentForm";
import { PatientPortalHeader } from "@/modules/paciente-portal/components/PatientPortalHeader";

export default async function NewPatientAppointmentPage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const medicoIdParam = firstSearchParam(params.medicoId);
  const especialidadIdParam = firstSearchParam(params.especialidadId);
  const [specialties, professionals] = await Promise.all([getEspecialidades(), getMedicos()]);
  if (!specialties.ok || !professionals.ok) return <ApiErrorState title="No pudimos cargar el catálogo para la demostración" />;
  if (professionals.data.length === 0 || specialties.data.length === 0) return <EmptyState description="El catálogo no tiene datos disponibles para mostrar una solicitud visual." title="Catálogo vacío" />;
  const professionalFromUrl = professionals.data.find((professional) => professional.id === medicoIdParam);
  const requestedSpecialtyId = especialidadIdParam && specialties.data.some((specialty) => specialty.id === especialidadIdParam)
    ? especialidadIdParam
    : undefined;
  const selectedSpecialtyId = requestedSpecialtyId ?? professionalFromUrl?.specialtyId ?? specialties.data[0]?.id ?? "";
  const professionalsForSpecialty = professionals.data.filter((professional) => professional.specialtyId === selectedSpecialtyId);
  const selectedProfessional = professionalsForSpecialty.find((professional) => professional.id === medicoIdParam) ?? professionalsForSpecialty[0];
  const availability = selectedProfessional ? await getDisponibilidadMedico(selectedProfessional.id) : null;
  if (availability && !availability.ok) return <ApiErrorState title="No pudimos cargar los horarios de demostración" />;
  const slots = availability ? ordenarBloques(availability.data).map(toBloqueHorarioVista) : [];
  const formKey = `${selectedSpecialtyId}:${selectedProfessional?.id ?? ""}:${slots.map((slot) => slot.id).join("|")}`;
  return <div className="space-y-7"><PatientPortalHeader description="Selecciona un bloque disponible. La confirmación se atribuirá a tu identidad verificada por el backend." eyebrow="Nueva cita" title="Reservar una cita" /><PatientAppointmentForm key={formKey} professionals={professionals.data} selectedSpecialtyId={selectedSpecialtyId} selectedProfessionalId={selectedProfessional?.id ?? ""} slots={slots} specialties={specialties.data} /></div>;
}
