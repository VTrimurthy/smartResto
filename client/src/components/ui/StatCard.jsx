import { ArrowUpRight } from "lucide-react";

const StatCard = ({ title, value, subtitle, icon: Icon, trend }) => (
  <div className="glass-panel group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/60 hover:shadow-xl">
    {/* Top colored accent line */}
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-amber-500 opacity-80" />
    
    {/* Ambient radial blur in top corner */}
    <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-200/40 blur-2xl transition duration-300 group-hover:scale-125 group-hover:bg-brand-300/40" />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-600/90">{title}</p>
        <h3 className="mt-2.5 font-display text-4xl font-bold leading-none tracking-tight text-stone-900 md:text-[2.6rem]">
          {value}
        </h3>
      </div>
      
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100/80 bg-gradient-to-br from-white to-brand-50/80 p-2.5 text-brand-600 shadow-sm transition duration-300 group-hover:scale-110 group-hover:border-brand-300 group-hover:shadow-md group-hover:shadow-brand-500/10">
          <Icon className="h-6 w-6" />
        </div>
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50/80 text-brand-500">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      )}
    </div>

    {subtitle && (
      <div className="mt-4 flex items-center justify-between border-t border-brand-100/50 pt-3 text-xs text-stone-500">
        <p className="leading-relaxed">{subtitle}</p>
        {trend && (
          <span className="ml-2 font-semibold text-emerald-600">
            {trend}
          </span>
        )}
      </div>
    )}
  </div>
);

export default StatCard;
