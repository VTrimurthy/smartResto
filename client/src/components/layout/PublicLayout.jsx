import { ArrowRight, Bot, Menu, Sparkles, UserCircle2, UtensilsCrossed, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import Footer from "./Footer";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../context/ConfirmDialogContext";
import { useToast } from "../../context/ToastContext";
import { joinClasses, toSentenceCase } from "../../utils/helpers";

const links = [
  { to: "/", label: "Home" },
  { to: "/book-table", label: "Book Table" },
  { to: "/order-online", label: "Order Online" },
  { to: "/support", label: "AI Support" },
];

const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { confirm } = useConfirm();
  const { pushToast } = useToast();
  const publicLinks = user?.role === "guest" ? [...links, { to: "/my-activity", label: "My Activity" }] : links;

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Logout from Dineazy?",
      description: "You can still browse the public portal after signing out.",
      confirmLabel: "Logout",
    });

    if (!confirmed) {
      return;
    }

    setMobileOpen(false);
    logout();
    pushToast({
      title: "Logged out",
      message: "You are back in guest browsing mode.",
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden">
      {/* Background radial atmosphere */}
      <div className="pointer-events-none fixed inset-0 grid-pattern opacity-35" />
      
      {/* Top Banner / Announcement Bar */}
      <div className="relative z-50 border-b border-brand-200/50 bg-gradient-to-r from-stone-900 via-stone-800 to-brand-950 px-4 py-2 text-center text-xs font-semibold text-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-brand-400">
            <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: "6s" }} />
            <span className="font-bold tracking-wide uppercase text-[10px]">Smart Restaurant AI</span>
          </span>
          <span className="hidden sm:inline text-stone-400">•</span>
          <span className="hidden sm:inline text-stone-200">Non-Expiring Sessions & Real-Time Kitchen Operations</span>
          <Link
            to="/order-online"
            className="inline-flex items-center gap-1 font-bold text-brand-400 hover:text-brand-300 transition underline underline-offset-2"
          >
            <span>Explore Menu</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Glass Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-brand-100/70 bg-white/90 backdrop-blur-2xl shadow-[0_4px_25px_rgba(234,88,12,0.04)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 md:px-8">
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-brand-200/90 bg-white p-1 shadow-md shadow-brand-500/15 transition-transform duration-300 group-hover:scale-105">
              <img src="/logo.png" alt="Dineazy Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold leading-none tracking-tight text-stone-900">
                Dine<span className="text-brand-500">azy</span>
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-brand-600 transition group-hover:text-brand-700">
                Good Food • Made Easy
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 rounded-full border border-brand-100/80 bg-stone-50/70 p-1 backdrop-blur-md md:flex">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  joinClasses(
                    "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200",
                    isActive
                      ? "bg-white text-brand-600 shadow-sm"
                      : "text-stone-600 hover:text-brand-600 hover:bg-white/60"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* User / Auth Action Controls */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/70 px-3 py-1.5 shadow-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-xs">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-brand-600">{toSentenceCase(user.role)}</p>
                  </div>
                </div>

                {user.role !== "guest" ? (
                  <Link to="/dashboard" className="btn-secondary py-2 text-xs">
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/my-activity" className="btn-secondary py-2 text-xs">
                    My Activity
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className="btn-primary py-2 text-xs">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2.5 px-6 text-xs font-bold">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label="Toggle navigation"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-200/80 bg-white p-2 text-brand-700 shadow-sm md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="border-t border-brand-100 bg-white/95 px-6 py-5 backdrop-blur-2xl md:hidden animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-2">
              {publicLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    joinClasses(
                      "rounded-xl px-4 py-2.5 text-sm font-bold transition",
                      isActive ? "bg-brand-50 text-brand-600" : "text-stone-700 hover:bg-stone-50"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="mt-3 border-t border-stone-100 pt-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 px-2 py-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-xs">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900">{user.name}</p>
                        <p className="text-[10px] font-semibold text-brand-600 uppercase">{user.role}</p>
                      </div>
                    </div>

                    {user.role !== "guest" && (
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="btn-secondary w-full justify-center py-2.5 text-xs"
                      >
                        Operations Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn-primary w-full justify-center py-2.5 text-xs"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full justify-center py-2.5 text-xs"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Slot */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* Redesigned Luxury Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
