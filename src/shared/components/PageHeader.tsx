type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="serena-page-banner border-b border-[var(--serena-border)] text-white shadow-[var(--serena-shadow-card)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {eyebrow ? (
          <p className="serena-kicker mb-3 !text-[#DDF3F1]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="serena-enter serena-enter-1 max-w-3xl text-3xl font-black tracking-[-.04em] text-white sm:text-5xl">
          {title}
        </h1>
        <p className="serena-enter serena-enter-2 mt-4 max-w-3xl text-base leading-7 text-white/80 sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
