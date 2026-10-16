import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { clinicaInfo } from "@/modules/catalogo-medico/data";
import { getEspecialidades, getMedicos } from "@/modules/catalogo-medico/api";
import { ApiErrorState, LoadingState, buttonLinkClasses } from "@/shared/components";

const steps = [
  { number: "01", title: "Explora especialidades", description: "Conoce los servicios disponibles y elige según tus necesidades." },
  { number: "02", title: "Elige profesional y horario", description: "Consulta disponibilidad actualizada en hora de Guatemala." },
  { number: "03", title: "Confirma desde tu cuenta", description: "Tu reserva queda asociada de forma segura a tu sesión de paciente." },
];

export default function HomePage() {
  return (
    <>
      <section className="serena-home-hero px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pb-20 lg:pt-10">
        <div className="serena-home-frame mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] lg:min-h-[640px] lg:grid-cols-[1.05fr_.95fr] lg:rounded-[2.5rem]">
          <div className="serena-home-copy relative z-10 flex flex-col justify-center px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <p className="serena-home-eyebrow serena-enter serena-enter-1">Clínica Serena <span aria-hidden="true">·</span> Atención médica y odontológica</p>
            <h1 className="serena-enter serena-enter-2 mt-7 max-w-2xl text-[clamp(2.5rem,5.2vw,5.2rem)] font-black leading-[.99] tracking-[-.055em]">
              Tu sonrisa merece <span className="serena-home-highlight">sentirse bien cuidada.</span>
            </h1>
            <p className="serena-enter serena-enter-3 mt-7 max-w-lg text-base leading-8 text-white/80 sm:text-lg">{clinicaInfo.descripcion}</p>
            <div className="serena-enter serena-enter-4 mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className={`${buttonLinkClasses} !rounded-full !bg-[var(--serena-surface-info)] !px-7 !py-3 !text-[var(--serena-ink)] hover:!bg-white`} href="/reservar">
                Reservar una cita <span aria-hidden="true">↗</span>
              </Link>
              <Link className={`${buttonLinkClasses} !rounded-full !border-white/35 !bg-white/10 !px-7 !py-3 hover:!bg-white/20`} href="/medicos">
                Conocer profesionales
              </Link>
            </div>
            <div className="serena-enter serena-enter-4 mt-10 border-t border-white/20 pt-5">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-white/65">Tu visita, con claridad</p>
              <p className="mt-2 text-sm text-white/85">Explora · Elige · Confirma</p>
            </div>
          </div>
          <div className="serena-home-visual relative min-h-[390px] overflow-hidden bg-[var(--serena-surface-info)] sm:min-h-[480px] lg:min-h-full">
            <Image
              alt="Consultorio dental moderno, cálido y luminoso de Clínica Serena"
              className="serena-home-photo h-full w-full object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              src="/images/clinica-serena-hero.webp"
            />
            <div aria-hidden="true" className="serena-home-orbit" />
            <div className="serena-home-visual-card absolute bottom-5 left-5 right-5 max-w-sm rounded-[1.4rem] border border-white/75 bg-white/90 p-5 shadow-[0_22px_60px_rgb(38_50_56_/_0.18)] backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-auto sm:p-6">
              <span className="serena-section-label">A tu ritmo</span>
              <p className="mt-2 text-lg font-black leading-snug text-[var(--serena-ink)]">Horarios claros, reserva segura.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--serena-text)]">Consulta profesionales y disponibilidad antes de confirmar.</p>
            </div>
          </div>
        </div>
        <div className="serena-stagger mx-auto mt-5 grid max-w-7xl gap-3 sm:grid-cols-2">
          <Suspense fallback={<LoadingState message="Consultando disponibilidad..." />}><ResumenCatalogo /></Suspense>
        </div>
      </section>
      <section className="serena-home-steps border-t border-[var(--serena-border)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="serena-kicker">Una experiencia sencilla</p><h2 className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-[-.04em] text-[var(--serena-ink)] sm:text-5xl">Tu próxima visita comienza aquí.</h2></div>
            <p className="max-w-xl text-base leading-8 text-[var(--serena-text)] lg:justify-self-end">Encuentra la atención que necesitas, sin pasos confusos. Tres decisiones claras para reservar con tranquilidad.</p>
          </div>
          <div className="serena-stagger mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step) => <article className="serena-step" key={step.number}>
              <span aria-hidden="true" className="serena-step-number">{step.number}</span>
              <h3 className="mt-10 text-xl font-black tracking-tight text-[var(--serena-ink)]">{step.title}</h3>
              <p className="mt-3 max-w-xs leading-7 text-[var(--serena-text)]">{step.description}</p>
            </article>)}
          </div>
        </div>
      </section>
    </>
  );
}

async function ResumenCatalogo() {
  const [specialties, doctors] = await Promise.all([getEspecialidades(), getMedicos()]);
  if (!specialties.ok || !doctors.ok) return <div className="sm:col-span-2"><ApiErrorState description="No pudimos consultar el resumen en este momento." title="Información temporalmente no disponible" /></div>;
  return <>
    <Link aria-label={`Conocer ${doctors.data.length} profesionales`} className="serena-home-stat group bg-[var(--serena-success-soft)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--serena-shadow-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--serena-focus)] motion-reduce:transform-none" href="/medicos">
      <strong>{doctors.data.length}</strong><span>Profesionales para conocer</span><span aria-hidden="true" className="ml-auto text-xl transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none">→</span>
    </Link>
    <Link aria-label={`Explorar ${specialties.data.length} especialidades`} className="serena-home-stat group bg-[var(--serena-surface-info)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--serena-shadow-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--serena-focus)] motion-reduce:transform-none" href="/especialidades">
      <strong>{specialties.data.length}</strong><span>Especialidades para explorar</span><span aria-hidden="true" className="ml-auto text-xl transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none">→</span>
    </Link>
  </>;
}
