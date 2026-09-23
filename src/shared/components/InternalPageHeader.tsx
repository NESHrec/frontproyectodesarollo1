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
    <header className="flex flex-col gap-4 border-b border-[#62727B]/15 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#62727B]/70">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#62727B] sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#62727B]/80">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
