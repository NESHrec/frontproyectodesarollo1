type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="border-b border-[#62727B]/10 bg-[linear-gradient(120deg,#DDF3F1,#F4FAF5)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {eyebrow ? (
          <p className="serena-kicker mb-3">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-3xl font-black tracking-[-.03em] text-[#334B54] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#526871] sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
