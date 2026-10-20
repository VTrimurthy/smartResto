const PageHeader = ({ eyebrow, title, description, action }) => (
  <div className="relative mb-8 overflow-hidden rounded-[32px] border border-brand-100/90 bg-gradient-to-r from-white via-[#fffaf5] to-[#ffeedb]/60 px-6 py-7 shadow-[0_20px_50px_rgba(234,88,12,0.06)] backdrop-blur-xl md:px-8 md:py-8">
    {/* Decorative background orbs */}
    <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand-200/50 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-amber-100/60 blur-2xl" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

    <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/95 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-brand-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span>{eyebrow}</span>
          </div>
        ) : null}
        <h1 className="font-display text-4xl font-bold leading-none tracking-tight text-stone-900 md:text-[3.2rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3.5 max-w-3xl text-sm leading-relaxed text-stone-600 md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action && <div className="flex flex-wrap items-center gap-3">{action}</div>}
    </div>
  </div>
);

export default PageHeader;
