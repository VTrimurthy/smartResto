import { ChevronRight, LogOut, PanelLeftClose, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
import { NavLink } from "react-router-dom";

import { dashboardNavigation } from "../../data/navigation";
import { joinClasses, toSentenceCase } from "../../utils/helpers";

const Sidebar = ({ userRole, open, onClose }) => {
  const items = dashboardNavigation.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={joinClasses(
        "fixed inset-y-0 left-0 z-40 w-72 transform border-r border-brand-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,250,244,0.98))] backdrop-blur-2xl transition-transform duration-300 shadow-xl lg:static lg:translate-x-0 lg:shadow-none",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col p-5 overflow-y-auto">
        {/* Brand Header */}
        <div className="relative mb-6 overflow-hidden rounded-[26px] border border-brand-200/80 bg-white/95 p-4 shadow-sm">
          <div className="pointer-events-none absolute right-[-1rem] top-[-1rem] h-24 w-24 rounded-full bg-brand-100/60 blur-xl" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-brand-100 bg-white p-1 shadow-sm">
                <img src="/logo.png" alt="Dineazy Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold leading-none tracking-tight text-stone-900">
                  Dine<span className="text-brand-500">azy</span>
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-brand-600">Operations Console</p>
              </div>
            </div>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 shadow-sm lg:hidden"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-brand-100/90 bg-brand-50/70 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-stone-700">{toSentenceCase(userRole)}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
              Permanent JWT
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 rounded-[26px] border border-brand-100/70 bg-white/80 p-2.5 shadow-sm">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={({ isActive }) =>
                  joinClasses(
                    "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25"
                      : "text-stone-600 hover:bg-brand-50 hover:text-brand-700"
                  )
                }
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        className={joinClasses(
                          "flex h-8 w-8 items-center justify-center rounded-lg transition",
                          isActive
                            ? "bg-white/20 text-white"
                            : "border border-brand-100 bg-white text-brand-600 group-hover:border-brand-200"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/80" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Operations Platform Info Card */}
        <div className="mt-auto pt-6">
          <div className="rounded-[24px] border border-brand-100/80 bg-gradient-to-br from-brand-50/70 via-white to-amber-50/50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-brand-700">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.24em]">Smart Sync Active</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              Kitchen orders, bookings, and menus synchronized across all branch terminals with persistent authentication.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
