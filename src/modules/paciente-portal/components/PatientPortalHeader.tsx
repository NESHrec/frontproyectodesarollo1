import type { ReactNode } from "react";

export function PatientPortalHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-5 rounded-[var(--serena-radius-lg)] border border-[var(--serena-border)] bg-[linear-gradient(120deg,var(--serena-surface-info),var(--serena-surface))] p-6 shadow-[var(--serena-shadow-card)] md:flex-row md:items-end md:justify-between md:p-8">
      <div>
        <p className="serena-kicker">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.03em] text-[var(--serena-ink)] sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--serena-text)]/85">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-4 text-xl font-bold text-[var(--serena-ink)]">{title}</h2>;
}
