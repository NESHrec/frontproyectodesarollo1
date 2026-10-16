import type { ReactNode } from "react";
import Link from "next/link";
import { DentalScene } from "@/shared/components/DentalScene";
import { ThemeSwitcher } from "@/shared/components/ThemeSwitcher";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="serena-auth-theme serena-surface flex min-h-screen flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-3 whitespace-nowrap text-lg font-black tracking-tight text-[var(--serena-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#62727B]"
          href="/"
        >
          <span aria-hidden="true" className="serena-brand-mark grid size-10 place-items-center rounded-2xl bg-[var(--serena-ink)] text-xs tracking-wide text-white">CS</span>
          Clínica Serena
        </Link>
        <div className="flex items-center gap-3"><ThemeSwitcher /><Link
          className="rounded-md px-3 py-2 text-sm font-semibold text-[#62727B] hover:bg-[#DDF3F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B]"
          href="/"
        >
          Portal público
        </Link></div>
      </div>
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:gap-12 lg:px-8 lg:py-10">
        <div className="serena-auth-panel serena-enter serena-stagger flex min-h-[19rem] flex-col justify-between overflow-hidden rounded-[2rem] p-6 text-white sm:p-8 lg:min-h-[43rem] lg:p-10 xl:p-14">
          <div className="relative z-10">
            <p className="serena-home-eyebrow">Clínica Serena · Tu espacio</p>
            <p className="mt-7 max-w-md text-[clamp(2rem,3.7vw,4.4rem)] font-black leading-[1.03] tracking-[-.05em] lg:mt-12">Cuidarte empieza aquí.</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/80 lg:mt-6 lg:text-base lg:leading-8">Un acceso sencillo para continuar tu experiencia con claridad y tranquilidad.</p>
          </div>
          <div className="pointer-events-none absolute bottom-4 right-1 hidden w-[58%] opacity-85 lg:block"><DentalScene compact /></div>
          <div className="pointer-events-none mt-6 w-40 self-end opacity-85 lg:hidden"><DentalScene compact /></div>
          <p className="relative z-10 mt-10 border-t border-white/25 pt-6 text-sm font-semibold text-white/85 lg:mt-20">Tu atención, en un solo lugar.</p>
        </div>
        <div className="serena-enter serena-enter-2 flex w-full justify-center lg:py-8">{children}</div>
      </section>
    </main>
  );
}
