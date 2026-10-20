import { LogOut, Menu, Sparkles, UserCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../context/ConfirmDialogContext";
import { useToast } from "../../context/ToastContext";
import { dashboardNavigation } from "../../data/navigation";
import { toSentenceCase } from "../../utils/helpers";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { confirm } = useConfirm();
  const { pushToast } = useToast();
  const location = useLocation();

  const currentLabel = useMemo(() => {
    const item = dashboardNavigation.find((entry) => location.pathname === entry.to);
    return item?.label || "Dashboard";
  }, [location.pathname]);

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Sign out of the workspace?",
      description: "Your session token is permanently preserved, and you can resume anytime by signing back in.",
      confirmLabel: "Sign Out",
    });

    if (!confirmed) {
      return;
    }

    logout();
    pushToast({
      title: "Logged out",
      message: "Your workspace session has been closed safely.",
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf7f2]">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-4rem] h-80 w-80 rounded-full bg-brand-200/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-6rem] h-96 w-96 rounded-full bg-amber-200/25 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Responsive Sidebar */}
        <Sidebar userRole={user?.role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* Executive Top Bar */}
          <header className="sticky top-0 z-30 border-b border-brand-100/80 bg-white/90 backdrop-blur-2xl shadow-[0_4px_25px_rgba(234,88,12,0.03)]">
            <div className="flex items-center justify-between px-5 py-3.5 md:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-100 bg-white p-2 text-brand-700 shadow-sm lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-600">Executive Workspace</span>
                    <span className="hidden sm:inline text-stone-300">•</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Permanent JWT</span>
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold leading-none tracking-tight text-stone-900 md:text-3xl">
                    {currentLabel}
                  </h2>
                </div>
              </div>

              {/* User Profile & Actions */}
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2.5 rounded-2xl border border-brand-100 bg-white/90 px-3.5 py-1.5 shadow-sm md:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 font-bold text-white text-xs shadow-sm">
                    {user?.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-800 leading-tight">{user?.name}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">{toSentenceCase(user?.role)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5 text-stone-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Surface */}
          <main className="flex-1 p-4 md:p-8">
            <div className="dashboard-surface rounded-[32px] p-5 shadow-soft md:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
