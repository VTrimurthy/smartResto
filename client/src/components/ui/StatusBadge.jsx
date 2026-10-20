import { joinClasses, toSentenceCase } from "../../utils/helpers";

const statusConfig = {
  active: {
    bg: "bg-emerald-50/90 border-emerald-200/80 text-emerald-800",
    dot: "bg-emerald-500",
    pulse: true,
  },
  available: {
    bg: "bg-emerald-50/90 border-emerald-200/80 text-emerald-800",
    dot: "bg-emerald-500",
    pulse: true,
  },
  confirmed: {
    bg: "bg-emerald-50/90 border-emerald-200/80 text-emerald-800",
    dot: "bg-emerald-500",
    pulse: false,
  },
  paid: {
    bg: "bg-emerald-50/90 border-emerald-200/80 text-emerald-800",
    dot: "bg-emerald-500",
    pulse: false,
  },
  served: {
    bg: "bg-teal-50/90 border-teal-200/80 text-teal-800",
    dot: "bg-teal-500",
    pulse: false,
  },
  completed: {
    bg: "bg-stone-100 border-stone-200 text-stone-800",
    dot: "bg-stone-500",
    pulse: false,
  },
  pending: {
    bg: "bg-amber-50/90 border-amber-200/80 text-amber-800",
    dot: "bg-amber-500",
    pulse: true,
  },
  preparing: {
    bg: "bg-indigo-50/90 border-indigo-200/80 text-indigo-800",
    dot: "bg-indigo-500",
    pulse: true,
  },
  ready: {
    bg: "bg-sky-50/90 border-sky-200/80 text-sky-800",
    dot: "bg-sky-500",
    pulse: true,
  },
  reserved: {
    bg: "bg-cyan-50/90 border-cyan-200/80 text-cyan-800",
    dot: "bg-cyan-500",
    pulse: false,
  },
  occupied: {
    bg: "bg-rose-50/90 border-rose-200/80 text-rose-800",
    dot: "bg-rose-500",
    pulse: true,
  },
  cancelled: {
    bg: "bg-rose-50/90 border-rose-200/80 text-rose-700",
    dot: "bg-rose-400",
    pulse: false,
  },
  refunded: {
    bg: "bg-rose-50/90 border-rose-200/80 text-rose-700",
    dot: "bg-rose-400",
    pulse: false,
  },
  inactive: {
    bg: "bg-slate-50 border-slate-200 text-slate-600",
    dot: "bg-slate-400",
    pulse: false,
  },
  maintenance: {
    bg: "bg-orange-50/90 border-orange-200/80 text-orange-800",
    dot: "bg-orange-500",
    pulse: false,
  },
  cleaning: {
    bg: "bg-orange-50/90 border-orange-200/80 text-orange-800",
    dot: "bg-orange-500",
    pulse: false,
  },
  seated: {
    bg: "bg-teal-50/90 border-teal-200/80 text-teal-800",
    dot: "bg-teal-500",
    pulse: false,
  },
  "checked-in": {
    bg: "bg-teal-50/90 border-teal-200/80 text-teal-800",
    dot: "bg-teal-500",
    pulse: false,
  },
};

const StatusBadge = ({ value, className = "" }) => {
  const normalized = String(value || "inactive").toLowerCase();
  const config = statusConfig[normalized] || {
    bg: "bg-slate-50 border-slate-200 text-slate-700",
    dot: "bg-slate-400",
    pulse: false,
  };

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide shadow-sm backdrop-blur-sm transition-all",
        config.bg,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {config.pulse && (
          <span className={joinClasses("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", config.dot)} />
        )}
        <span className={joinClasses("relative inline-flex h-1.5 w-1.5 rounded-full", config.dot)} />
      </span>
      <span>{toSentenceCase(value)}</span>
    </span>
  );
};

export default StatusBadge;
