import type { ReactNode } from "react";

type InternalPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function InternalPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: InternalPageHeaderProps) {
  return (
    <header className="serena-internal-header flex flex-col gap-4 px-6 py-7 sm:px-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="serena-section-label">
          {eyebrow}
        </p>
        <h1 className="serena-enter serena-enter-1 mt-2 text-3xl font-black tracking-[-.04em] text-[var(--serena-ink)] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#62727B]/80">{description}</p>
      </div>
      {actions ? <div className="relative flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
