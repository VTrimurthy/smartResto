import { ArrowRight, Bot, Calendar, ChartColumnBig, ChefHat, Clock3, MapPin, Sparkles, Star, Table2, UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import SectionCard from "../../components/ui/SectionCard";
import { formatCurrency } from "../../utils/helpers";

const GuestHomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const loadPublicData = async () => {
      const [restaurantResponse, menuResponse, recommendationResponse] = await Promise.all([
        api.get("/restaurants"),
        api.get("/menu-items"),
        api.post("/ai/recommendations", { preference: "signature" }),
      ]);

      setRestaurants(restaurantResponse.data);
      setMenuItems(menuResponse.data.slice(0, 4));
      setRecommendations(recommendationResponse.data.recommendations);
    };

    loadPublicData().catch(() => undefined);
  }, []);

  const operatingSnapshot = useMemo(
    () => [
      { label: "Active branches", value: restaurants.length || "--", note: "Locations available for bookings & orders" },
      { label: "Curated dishes", value: menuItems.length || "--", note: "Fresh signature items on live menu" },
      { label: "AI Suggestions", value: recommendations.length || "--", note: "Flavor matches computed dynamically" },
    ],
    [menuItems.length, recommendations.length, restaurants.length]
  );

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.22),transparent_30%)]" />

      {/* Hero Section */}
      <section className="relative px-6 py-12 md:px-10 md:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 xl:grid-cols-[1.15fr_0.85fr]">
          {/* Left Column: Hero Copy */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-brand-200/90 bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-stone-800 shadow-sm backdrop-blur-md">
              <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full">
                <img src="/logo.png" alt="" className="h-full w-full object-contain" />
              </span>
              <span>Dineazy • Good Food, Made Easy</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.96] tracking-tight text-stone-900 md:text-7xl lg:text-[5.2rem]">
              Elevated dining with <span className="text-gradient">intelligent AI service</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
              Dineazy brings together real-time table reservations, digital gourmet ordering, AI dish recommendations, and unified restaurant operations into one seamless dining platform.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/book-table" className="btn-primary px-7 py-3.5 text-base shadow-lg shadow-brand-500/25">
                <Calendar className="mr-2 h-4 w-4" />
                Reserve a Table
              </Link>
              <Link to="/order-online" className="btn-secondary px-7 py-3.5 text-base bg-white/95 shadow-sm">
                <UtensilsCrossed className="mr-2 h-4 w-4 text-brand-600" />
                Order Food Online
              </Link>
            </div>

            {/* Quick feature highlights */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Table2, title: "Instant Booking", note: "Reserve tables with immediate confirmation and guest preferences." },
                { icon: UtensilsCrossed, title: "Live Digital Menu", note: "Explore curated dishes with spice indicators and chef notes." },
                { icon: Bot, title: "AI Flavor Guide", note: "Personalized dish recommendations based on taste and budget." },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-300"
                >
                  <div className="pointer-events-none absolute right-[-1.5rem] top-[-1.5rem] h-20 w-20 rounded-full bg-brand-100/60 blur-xl group-hover:scale-125 transition" />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-600 shadow-sm group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:shadow-md transition">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <p className="mt-4 font-bold text-stone-900">{feature.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-stone-600">{feature.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Live Snapshot */}
          <div className="glass-card p-6 md:p-8">
            <div className="rounded-[30px] border border-brand-100/80 bg-gradient-to-br from-white via-[#fffcf9] to-[#ffeedb]/60 p-6 md:p-7 shadow-[0_24px_60px_rgba(234,88,12,0.08)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/80 bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-700">
                    <Sparkles className="h-3 w-3 text-brand-500" />
                    <span>Live Operations</span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-stone-900">
                    Current Platform Activity
                  </h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-600 shadow-sm">
                  <ChartColumnBig className="h-5 w-5" />
                </div>
              </div>

              {/* Operating Metrics */}
              <div className="grid gap-3.5 sm:grid-cols-3">
                {operatingSnapshot.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-brand-100/80 bg-white/95 p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-600">{item.label}</p>
                    <h3 className="mt-2 font-display text-3xl font-bold text-stone-900 md:text-4xl">{item.value}</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-stone-500">{item.note}</p>
                  </div>
                ))}
              </div>

              {/* Operating Note */}
              <div className="mt-5 rounded-2xl border border-brand-100/80 bg-brand-50/70 p-4">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Non-Expiring Sessions & Live Sync</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                      Kitchen orders, table reservations, and AI insights operate on permanent JWT credentials with continuous data integrity.
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Recommended Dishes Spotlight */}
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Chef's AI Recommendations</p>
                {recommendations.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-brand-100/80 bg-white/95 p-3.5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition"
                      />
                      <div>
                        <p className="text-sm font-bold text-stone-900 group-hover:text-brand-600 transition">{item.name}</p>
                        <p className="text-xs text-stone-500 line-clamp-1">{item.reason}</p>
                        <p className="mt-1 text-xs font-bold text-brand-600">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <Link
                      to="/order-online"
                      className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-500 hover:text-white"
                    >
                      Order
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches & Popular Dishes Section */}
      <section className="px-6 pb-16 md:px-10 md:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Branches in Service */}
          <SectionCard
            title="Branches in Service"
            subtitle="Each location preserves its signature dining ambiance while connected to one central intelligence platform."
          >
            <div className="grid gap-6 md:grid-cols-2">
              {restaurants.map((restaurant) => (
                <article
                  key={restaurant._id}
                  className="group overflow-hidden rounded-[26px] border border-brand-100/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={restaurant.heroImage}
                      alt={restaurant.name}
                      className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <div>
                        <h3 className="font-display text-xl font-bold leading-tight drop-shadow">{restaurant.name}</h3>
                        <p className="flex items-center gap-1 text-xs text-stone-200">
                          <MapPin className="h-3 w-3 text-brand-400" />
                          <span>{restaurant.address?.city}, {restaurant.address?.state}</span>
                        </p>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm border border-amber-300/30">
                        <Star className="h-3 w-3 fill-amber-300" />
                        <span>{restaurant.rating}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs leading-relaxed text-stone-600 line-clamp-2">{restaurant.description}</p>
                    
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {restaurant.cuisineTypes?.map((cuisine) => (
                        <span
                          key={cuisine}
                          className="rounded-full border border-brand-100 bg-brand-50/70 px-2.5 py-0.5 text-[10px] font-semibold text-brand-700"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-brand-100/50 pt-3">
                      <span className="text-[11px] text-stone-400">Hours: {restaurant.openingHours || "10 AM - 11 PM"}</span>
                      <Link
                        to="/book-table"
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition"
                      >
                        <span>Reserve</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          {/* Popular Right Now Menu Preview */}
          <SectionCard
            title="Signature Dishes"
            subtitle="Explore public culinary highlights prepared fresh daily across our branches."
          >
            <div className="space-y-3.5">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className="group flex items-center gap-4 rounded-2xl border border-brand-100/80 bg-white/95 p-3.5 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-stone-900 group-hover:text-brand-600 transition">{item.name}</p>
                      <span className={`h-2 w-2 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{item.category} • {item.description}</p>
                    <p className="mt-1 font-bold text-brand-600 text-sm">{formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/order-online"
              className="btn-primary mt-6 w-full justify-center py-3.5 font-bold shadow-md shadow-brand-500/20"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </SectionCard>
        </div>
      </section>
    </div>
  );
};

export default GuestHomePage;
