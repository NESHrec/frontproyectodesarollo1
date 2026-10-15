import type { ReactNode } from "react";

export function PatientPortalHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="relative flex flex-col gap-5 overflow-hidden rounded-[var(--serena-radius-lg)] border border-[var(--serena-border)] bg-[linear-gradient(120deg,var(--serena-ink),#56777A)] p-6 text-white shadow-[var(--serena-shadow-card)] md:flex-row md:items-end md:justify-between md:p-8">
      <span aria-hidden="true" className="absolute -right-10 -top-16 size-56 rounded-full border-[20px] border-white/10" />
      <div>
        <p className="relative text-xs font-bold uppercase tracking-[0.16em] text-[#DDF3F1]">{eyebrow}</p>
        <h1 className="relative mt-2 text-3xl font-black tracking-[-.03em] text-white sm:text-4xl">{title}</h1>
        <p className="relative mt-3 max-w-3xl text-sm leading-6 text-white/80">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-4 text-xl font-bold text-[var(--serena-ink)]">{title}</h2>;
}
