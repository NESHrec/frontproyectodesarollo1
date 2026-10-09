import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { clinicaInfo } from "@/modules/catalogo-medico/data";
import { getEspecialidades, getMedicos } from "@/modules/catalogo-medico/api";
import { ApiErrorState, LoadingState, buttonLinkClasses } from "@/shared/components";

export default function HomePage() {
  return <>
    <section className="px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-12">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[.92fr_1.08fr]">
        <div className="max-w-xl">
          <p className="serena-kicker">Atención dental con calma</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-.04em] text-[#334B54] sm:text-5xl lg:text-6xl">Tu sonrisa, cuidada con cercanía y confianza.</h1>
          <p className="mt-6 text-lg leading-8 text-[#526871]">{clinicaInfo.descripcion}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link className={buttonLinkClasses} href="/reservar">Reservar una cita</Link><Link className={`${buttonLinkClasses} bg-white`} href="/medicos">Conocer profesionales</Link></div>
          <div className="mt-8 grid grid-cols-2 gap-3" aria-label="Resumen del catálogo"><Suspense fallback={<LoadingState message="Consultando disponibilidad..." />}><ResumenCatalogo /></Suspense></div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] bg-[#DDF3F1] shadow-[0_28px_80px_rgba(51,75,84,.18)]">
          <Image alt="Consultorio dental moderno, cálido y luminoso de Clínica Serena" className="h-[360px] w-full object-cover sm:h-[470px] lg:h-[560px]" height={914} priority sizes="(max-width: 1024px) 100vw, 54vw" src="/images/clinica-serena-hero.webp" width={1600} />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/92 p-4 shadow-lg backdrop-blur sm:inset-x-6 sm:bottom-6"><p className="font-bold text-[#334B54]">Horarios claros, reserva segura</p><p className="mt-1 text-sm text-[#62727B]">Consulta profesionales y disponibilidad antes de confirmar.</p></div>
        </div>
      </div>
    </section>
    <section className="border-y border-[#62727B]/10 bg-white/70 px-4 py-14 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><p className="serena-kicker">Una experiencia sencilla</p><h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-[#334B54]">Encuentra la atención que necesitas, sin pasos confusos.</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{[['01','Explora especialidades','Conoce los servicios disponibles y elige según tus necesidades.'],['02','Elige profesional y horario','Consulta disponibilidad actualizada en hora de Guatemala.'],['03','Confirma desde tu cuenta','Tu reserva queda asociada de forma segura a tu sesión de paciente.']].map(([number,title,text]) => <article className="serena-card p-6" key={number}><span className="text-sm font-black text-[#56777A]">{number}</span><h3 className="mt-4 text-xl font-bold text-[#334B54]">{title}</h3><p className="mt-3 leading-7 text-[#62727B]">{text}</p></article>)}</div></div></section>
  </>;
}

async function ResumenCatalogo() {
  const [specialties, doctors] = await Promise.all([getEspecialidades(), getMedicos()]);
  if (!specialties.ok || !doctors.ok) return <div className="col-span-2"><ApiErrorState description="No pudimos consultar el resumen en este momento." title="Información temporalmente no disponible" /></div>;
  return <><div className="rounded-2xl bg-[#E5F1D8] p-4"><strong className="block text-2xl text-[#334B54]">{doctors.data.length}</strong><span className="text-sm text-[#526871]">Profesionales</span></div><div className="rounded-2xl bg-[#DDF3F1] p-4"><strong className="block text-2xl text-[#334B54]">{specialties.data.length}</strong><span className="text-sm text-[#526871]">Especialidades</span></div></>;
}
