const SectionCard = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`glass-panel p-6 md:p-7 transition-all duration-300 ${className}`}>
    {(title || subtitle || action) && (
      <div className="mb-6 flex flex-col gap-3 border-b border-brand-100/70 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          {title ? (
            <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900 md:text-[1.85rem]">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm leading-relaxed text-stone-500">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action && <div className="flex items-center gap-2.5">{action}</div>}
      </div>
    )}
    {children}
  </section>
);

export default SectionCard;
