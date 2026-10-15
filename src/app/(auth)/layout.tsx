import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="serena-surface flex min-h-screen flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-3 text-lg font-black tracking-tight text-[var(--serena-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#62727B]"
          href="/"
        >
          <span aria-hidden="true" className="serena-brand-mark grid size-10 place-items-center rounded-2xl bg-[var(--serena-ink)] text-xs tracking-wide text-white">CS</span>
          Clínica Serena
        </Link>
        <Link
          className="rounded-md px-3 py-2 text-sm font-semibold text-[#62727B] hover:bg-[#DDF3F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B]"
          href="/"
        >
          Portal público
        </Link>
      </div>
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:gap-12 lg:px-8 lg:py-10">
        <div className="serena-auth-panel serena-enter hidden min-h-[34rem] flex-col justify-between overflow-hidden rounded-[2rem] p-10 text-white lg:flex xl:p-14">
          <div className="relative z-10">
            <p className="serena-home-eyebrow">Clínica Serena · Tu espacio</p>
            <p className="mt-12 max-w-md text-[clamp(2.8rem,3.7vw,4.4rem)] font-black leading-[1.03] tracking-[-.05em]">Cuidarte empieza aquí.</p>
            <p className="mt-6 max-w-sm text-base leading-8 text-white/80">Un acceso sencillo para continuar tu experiencia con claridad y tranquilidad.</p>
          </div>
          <p className="relative z-10 border-t border-white/25 pt-6 text-sm font-semibold text-white/85">Tu atención, en un solo lugar.</p>
        </div>
        <div className="serena-enter serena-enter-2 flex w-full justify-center lg:py-8">{children}</div>
      </section>
    </main>
  );
}
