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
    <header className="flex flex-col gap-4 border-b border-[var(--serena-border)] pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="serena-section-label">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.03em] text-[var(--serena-ink)] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#62727B]/80">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
