type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="serena-page-banner border-b border-[var(--serena-border)] text-white shadow-[var(--serena-shadow-card)]">
      <div className="mx-auto grid max-w-7xl items-end gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8 lg:py-16">
        <div className="relative z-10">
          {eyebrow ? <p className="serena-page-eyebrow serena-enter serena-enter-1 mb-4">{eyebrow}</p> : null}
          <h1 className="serena-enter serena-enter-1 max-w-3xl text-3xl font-black tracking-[-.04em] text-white sm:text-5xl">{title}</h1>
          <p className="serena-enter serena-enter-2 mt-4 max-w-3xl text-base leading-7 text-white/80 sm:text-lg">{description}</p>
        </div>
        <div aria-hidden="true" className="serena-page-mark hidden items-center gap-4 lg:flex">
          <span className="serena-page-mark-symbol">CS</span>
          <span className="text-[10px] font-extrabold uppercase leading-5 tracking-[.18em] text-white/70">Clínica<br />Serena</span>
        </div>
      </div>
    </section>
  );
}
