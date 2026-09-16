import { horariosDisponibles, medicos } from "@/modules/catalogo-medico/data";
import { PreAppointmentFlow } from "@/modules/catalogo-medico/components/PreAppointmentFlow";
import { PageHeader } from "@/shared/components";

export default function ReservarPage() {
  return (
    <>
      <PageHeader
        description="Selecciona un profesional y un bloque horario para simular una solicitud inicial. Esta pantalla no guarda citas reales."
        eyebrow="Pre-agendamiento"
        title="Reserva visual de cita"
      />
      <section className="bg-[#FBFCFA] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <PreAppointmentFlow horarios={horariosDisponibles} medicos={medicos} />
        </div>
      </section>
    </>
  );
}
