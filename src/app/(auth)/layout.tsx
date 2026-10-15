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
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-2xl bg-[var(--serena-ink)] text-xs tracking-wide text-white">CS</span>
          Clínica Serena
        </Link>
        <Link
          className="rounded-md px-3 py-2 text-sm font-semibold text-[#62727B] hover:bg-[#DDF3F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#62727B]"
          href="/"
        >
          Portal público
        </Link>
      </div>
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </section>
    </main>
  );
}
