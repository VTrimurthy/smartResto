import { ArrowUpRight, Clock, MapPin, Sparkles, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative mt-20 border-t border-brand-100/80 bg-gradient-to-b from-white/90 via-[#fffbf7]/90 to-[#ffeedb]/50 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="group inline-flex items-center gap-3.5">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-brand-100 bg-white p-1 shadow-md shadow-brand-500/10 transition group-hover:scale-105 group-hover:shadow-brand-500/20">
                <img src="/logo.png" alt="Dineazy Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="font-display text-3xl font-bold leading-none tracking-tight text-stone-900">
                  Dine<span className="text-brand-500">azy</span>
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-stone-500 transition group-hover:text-brand-600">
                  Good Food • Made Easy
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-stone-600">
              Modern AI-assisted hospitality operating platform. Bringing seamless reservations, digital food ordering, intelligent dish recommendations, and branch operations together in one place.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>All Branches Operational • Live Platform</span>
            </div>
          </div>

          {/* Guest Navigation */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-600">Guest Portal</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-stone-600 transition hover:text-brand-600">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/book-table" className="text-stone-600 transition hover:text-brand-600">
                  Reserve a Table
                </Link>
              </li>
              <li>
                <Link to="/order-online" className="text-stone-600 transition hover:text-brand-600">
                  Order Food Online
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-stone-600 transition hover:text-brand-600">
                  AI Support Assistant
                </Link>
              </li>
              <li>
                <Link to="/my-activity" className="text-stone-600 transition hover:text-brand-600">
                  My Bookings & Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Features */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-600">Smart Features</p>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-600">
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                <span>AI Flavor Recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-brand-500" />
                <span>Busy-Hour Predictions</span>
              </li>
              <li className="flex items-center gap-2">
                <UtensilsCrossed className="h-3.5 w-3.5 text-brand-500" />
                <span>Live Menu Availability</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-brand-500" />
                <span>Multi-Branch Operations</span>
              </li>
            </ul>
          </div>

          {/* Workspace & Portal Access */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-600">Workspace</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-stone-800 transition hover:text-brand-600">
                  Staff & Admin Sign In
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand-500" />
                </Link>
              </li>
              <li className="text-xs leading-5 text-stone-500">
                Multi-role access for Super Admin, Restaurant Admin, Staff, and Guest profiles.
              </li>
              <li className="pt-2 text-xs text-stone-500">
                <span className="font-semibold text-stone-700">Service Hours:</span> Mon – Sun, 10:00 AM – 11:30 PM
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-100/60 pt-6 text-xs text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Dineazy. Good Food • Made Easy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Hospitality Intelligence</span>
            <span>•</span>
            <Link to="/support" className="transition hover:text-brand-600">
              Help & Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
