import { Building2, CalendarClock, CheckCircle2, ChevronRight, ClipboardList, IndianRupee, ShoppingBag, Sparkles, Star, UsersRound, UtensilsCrossed } from "lucide-react";

import BusyHourChart from "../../components/charts/BusyHourChart";
import DonutStatusChart from "../../components/charts/DonutStatusChart";
import LineSalesChart from "../../components/charts/LineSalesChart";
import PageHeader from "../../components/layout/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import LoadingScreen from "../../components/ui/LoadingScreen";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useApiQuery } from "../../context/QueryClientContext";
import { formatCurrency, formatDate, formatDateTime, formatTime } from "../../utils/helpers";

const getRoleHighlights = (data, role) => {
  const liveOrders = data.recentOrders.filter((order) => ["pending", "preparing", "ready"].includes(order.status)).length;
  const peakHour = [...data.busyHours].sort((left, right) => right.traffic - left.traffic)[0];

  if (role === "staff") {
    return [
      { title: "Live Floor Orders", value: liveOrders, subtitle: "Orders needing kitchen/floor action", icon: ShoppingBag, trend: "Live Feed" },
      { title: "Upcoming Bookings", value: data.stats.totalBookings, subtitle: "Guest arrivals in the pipeline", icon: ClipboardList, trend: "Today" },
      { title: "Peak Service Window", value: peakHour?.label || "-", subtitle: "Highest volume dining window", icon: CalendarClock, trend: "Focus" },
      { title: "Tables in Service", value: data.stats.totalTables, subtitle: "Floor tables mapped in branch", icon: Building2, trend: "Active" },
    ];
  }

  if (role === "restaurant-admin") {
    return [
      { title: "Recorded Revenue", value: formatCurrency(data.stats.revenue), subtitle: "Total branch recorded revenue", icon: IndianRupee, trend: "+12.4% vs last week" },
      { title: "Total Orders", value: data.stats.totalOrders, subtitle: "Across dine-in, takeaway, delivery", icon: ShoppingBag, trend: "Active" },
      { title: "Total Bookings", value: data.stats.totalBookings, subtitle: "Guest reservations and bookings", icon: ClipboardList, trend: "Healthy" },
      { title: "Predicted Occupancy", value: `${data.stats.occupancyRate}%`, subtitle: "Predictive table load average", icon: CalendarClock, trend: "Target: 75%" },
    ];
  }

  return [
    { title: "Platform Revenue", value: formatCurrency(data.stats.revenue), subtitle: "Consolidated chain revenue", icon: IndianRupee, trend: "+14.8% growth" },
    { title: "Active Branches", value: data.stats.totalRestaurants, subtitle: "Operational brand locations", icon: Building2, trend: "All Live" },
    { title: "Consolidated Orders", value: data.stats.totalOrders, subtitle: "System-wide order throughput", icon: ShoppingBag, trend: "Real-time" },
    { title: "Chain Occupancy", value: `${data.stats.occupancyRate}%`, subtitle: "Average table utilization", icon: CalendarClock, trend: "Optimal" },
  ];
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, error, isLoading } = useApiQuery({
    queryKey: ["dashboard-summary", user?.role || "unknown"],
    url: "/dashboard/summary",
    staleTime: 45000,
  });

  if (isLoading && !data) {
    return <LoadingScreen label="Loading executive operations cockpit..." />;
  }

  const statCards = data ? getRoleHighlights(data, user?.role) : [];
  const showChainView = user?.role === "super-admin";

  return (
    <div>
      <PageHeader
        eyebrow="Operations Cockpit"
        title="Hospitality Operations Overview"
        description="Unified management surface with role-aware metrics, live service pressure, predictive occupancy, and real-time floor activity."
      />

      {error ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm font-medium text-rose-700 shadow-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800 text-xs font-bold">!</span>
          <span>{error}</span>
        </div>
      ) : null}

      {data ? (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                trend={card.trend}
              />
            ))}
          </div>

          {/* Charts Row: Revenue Line Chart + Donut Status Mix */}
          <div className="mb-8 grid gap-8 xl:grid-cols-[1.6fr_1fr]">
            <SectionCard
              title="Weekly Revenue Velocity"
              subtitle="Daily tracked revenue across active dining and digital order channels."
            >
              <div className="pt-2">
                <LineSalesChart data={data.salesTrend} />
              </div>
            </SectionCard>

            <SectionCard
              title="Order Status Distribution"
              subtitle="Real-time operational distribution of kitchen and floor orders."
            >
              <div className="pt-2">
                <DonutStatusChart data={data.orderStatusBreakdown} />
              </div>
            </SectionCard>
          </div>

          {/* Service Analytics Row: Busy Hour Concentration + Top Selling Dishes */}
          <div className="mb-8 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
            <SectionCard
              title="Traffic & Busy Hour Forecasting"
              subtitle="Hourly demand concentration calculated from orders, bookings, and reservations."
            >
              <div className="pt-2">
                <BusyHourChart data={data.busyHours} />
              </div>
            </SectionCard>

            <SectionCard
              title="Signature Seller Dishes"
              subtitle="Highest revenue and order volume items across menus."
            >
              <div className="space-y-3.5 pt-1">
                {data.popularItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-brand-100/80 bg-white/95 p-3.5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 font-bold text-brand-700 text-xs shadow-inner border border-brand-100">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-stone-900 leading-tight">{item.name}</p>
                        <p className="text-xs text-stone-500">{item.orders} orders fulfilled</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 text-sm">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Real-Time Live Feed: Recent Orders + Recent Bookings */}
          <div className="mb-8 grid gap-8 xl:grid-cols-[1.25fr_1fr]">
            <SectionCard
              title="Recent Floor Orders"
              subtitle="Live dispatch stream from branch kitchens and delivery points."
            >
              <div className="space-y-3 pt-1">
                {data.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col gap-3 rounded-2xl border border-brand-100/80 bg-white/95 p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-600">{order.orderNumber}</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs font-semibold text-stone-500 uppercase">{order.orderType}</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-stone-900">
                        {order.customerName} <span className="font-normal text-xs text-stone-500">at {order.restaurant?.name || "Branch"}</span>
                      </p>
                      <p className="text-[11px] text-stone-400">{formatDate(order.placedAt)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge value={order.status} />
                      <span className="text-sm font-bold text-stone-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Upcoming Guest Bookings"
              subtitle="Scheduled guest arrivals and reserved table pipelines."
            >
              <div className="space-y-3 pt-1">
                {data.recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="rounded-2xl border border-brand-100/80 bg-white/95 p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-stone-900">{booking.guestName}</p>
                        <p className="text-xs text-stone-500">{booking.restaurant?.name || "Branch"}</p>
                      </div>
                      <StatusBadge value={booking.status} />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs text-stone-600 border-t border-brand-100/50 pt-2">
                      <span>{formatDate(booking.bookingDate)} at {formatTime(booking.timeSlot)}</span>
                      <span className="font-semibold text-brand-600">{booking.guestCount} Guests</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Audit Trail & Team Snapshot */}
          <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
            <SectionCard
              title="Administrative Audit Feed"
              subtitle="Immutable log of recent system creations, edits, status transitions, and role actions."
            >
              <div className="space-y-3 pt-1 max-h-[360px] overflow-y-auto pr-1">
                {(data.recentActivity || []).map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-brand-100/70 bg-white/90 p-3.5 shadow-sm"
                  >
                    <div className="pr-2">
                      <p className="text-xs font-bold text-stone-900 leading-snug">{entry.message}</p>
                      <p className="mt-1 text-[11px] text-stone-500">
                        {entry.actorName || entry.actor?.name || "Team Member"} • {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                    <StatusBadge value={entry.action} />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Platform Infrastructure"
              subtitle="Active branch nodes, mapped tables, and catalogue items."
            >
              <div className="grid gap-3.5">
                <StatCard title="Total Staff Users" value={data.stats.totalUsers} subtitle="Role-mapped system operators" icon={UsersRound} />
                <StatCard title="Mapped Service Tables" value={data.stats.totalTables} subtitle="Active dining zone capacities" icon={CalendarClock} />
                <StatCard title="Dishes in Catalog" value={data.stats.totalMenuItems} subtitle="Live menu formulations" icon={ShoppingBag} />
              </div>
            </SectionCard>
          </div>

          {/* Cross-Branch Chain Performance (For Super Admin) */}
          {showChainView ? (
            <SectionCard
              title="Multi-Branch Chain Performance"
              subtitle="Comparative revenue, guest ratings, and booking throughput across brand locations."
              className="mt-8"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {data.topRestaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.name}
                    className="glass-panel group relative overflow-hidden p-6 transition hover:border-brand-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Branch #{index + 1}</span>
                        <h4 className="mt-1 font-display text-2xl font-bold text-stone-900 group-hover:text-brand-600 transition">
                          {restaurant.name}
                        </h4>
                      </div>
                      <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{restaurant.rating}</span>
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-brand-100/60 pt-4 text-xs">
                      <div>
                        <span className="text-stone-400 font-medium">Branch Revenue</span>
                        <p className="mt-0.5 text-base font-bold text-stone-900">{formatCurrency(restaurant.revenue)}</p>
                      </div>
                      <div>
                        <span className="text-stone-400 font-medium">Bookings Fulfilled</span>
                        <p className="mt-0.5 text-base font-bold text-stone-900">{restaurant.bookings} Guests</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default DashboardPage;
