import { Award, BarChart3, Download, FileText, Lightbulb, Printer, Sparkles, TrendingUp, UtensilsCrossed } from "lucide-react";

import BusyHourChart from "../../components/charts/BusyHourChart";
import DonutStatusChart from "../../components/charts/DonutStatusChart";
import LineSalesChart from "../../components/charts/LineSalesChart";
import PageHeader from "../../components/layout/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { useApiQuery } from "../../context/QueryClientContext";
import { useToast } from "../../context/ToastContext";
import { downloadCsv, openPrintWindow } from "../../utils/helpers";

const ReportsPage = () => {
  const { pushToast } = useToast();
  const { data: report, error, isLoading } = useApiQuery({
    queryKey: ["reports-overview"],
    url: "/reports/overview",
    staleTime: 45000,
  });

  const exportCsv = () => {
    if (!report) {
      return;
    }

    downloadCsv("smart-restaurant-report.csv", [
      ["Card", "Value", "Subtitle"],
      ...report.cards.map((card) => [card.title, card.value, card.subtitle]),
      [],
      ["Top Restaurant", "Revenue", "Bookings", "Rating"],
      ...report.topRestaurants.map((restaurant) => [restaurant.name, restaurant.revenue, restaurant.bookings, restaurant.rating]),
      [],
      ["Top Item", "Orders", "Revenue"],
      ...report.topItems.map((item) => [item.name, item.orders, item.revenue]),
    ]);

    pushToast({
      tone: "success",
      title: "CSV exported",
      message: "The current report snapshot has been downloaded.",
    });
  };

  const exportPdf = () => {
    if (!report) {
      return;
    }

    openPrintWindow({
      title: "Smart Restaurant Performance Report",
      sections: [
        `<p>${report.narrative.join(" ")}</p>`,
        `<h2>Summary Cards</h2>
         <table>
           <thead><tr><th>Card</th><th>Value</th><th>Subtitle</th></tr></thead>
           <tbody>
             ${report.cards.map((card) => `<tr><td>${card.title}</td><td>${card.value}</td><td>${card.subtitle}</td></tr>`).join("")}
           </tbody>
         </table>`,
        `<h2>Top Restaurants</h2>
         <table>
           <thead><tr><th>Branch</th><th>Revenue</th><th>Bookings</th><th>Rating</th></tr></thead>
           <tbody>
             ${report.topRestaurants
               .map((restaurant) => `<tr><td>${restaurant.name}</td><td>${restaurant.revenue}</td><td>${restaurant.bookings}</td><td>${restaurant.rating}</td></tr>`)
               .join("")}
           </tbody>
         </table>`,
        `<h2>Top Items</h2>
         <table>
           <thead><tr><th>Dish</th><th>Orders</th><th>Revenue</th></tr></thead>
           <tbody>
             ${report.topItems.map((item) => `<tr><td>${item.name}</td><td>${item.orders}</td><td>${item.revenue}</td></tr>`).join("")}
           </tbody>
         </table>`,
      ],
    });

    pushToast({
      tone: "success",
      title: "PDF view opened",
      message: "Use the print dialog to save the report as PDF.",
    });
  };

  if (isLoading && !report) {
    return <LoadingScreen label="Generating executive reports and analytics..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Business Intelligence"
        title="Executive Performance Reporting"
        description="Comprehensive analysis of financial velocity, branch occupancy, menu item traction, and operational demand signals."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={exportCsv}
              className="btn-secondary py-2.5 text-xs font-bold"
            >
              <Download className="mr-1.5 h-4 w-4 text-brand-600" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={exportPdf}
              className="btn-primary py-2.5 text-xs font-bold shadow-md shadow-brand-500/25"
            >
              <Printer className="mr-1.5 h-4 w-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        }
      />

      {error ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm font-medium text-rose-700 shadow-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800 text-xs font-bold">!</span>
          <span>{error}</span>
        </div>
      ) : null}

      {report ? (
        <>
          {/* Top 4 Metric Highlights */}
          <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {report.cards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={FileText}
              />
            ))}
          </div>

          {/* Revenue Velocity & Category Mix Charts */}
          <div className="mb-8 grid gap-8 xl:grid-cols-[1.6fr_1fr]">
            <SectionCard
              title="Consolidated Revenue Velocity"
              subtitle="Seven-day revenue performance and order trajectory."
            >
              <div className="pt-2">
                <LineSalesChart data={report.salesTrend} />
              </div>
            </SectionCard>

            <SectionCard
              title="Menu Category Mix"
              subtitle="Sales contribution breakdown across appetizers, mains, desserts, and drinks."
            >
              <div className="pt-2">
                <DonutStatusChart data={report.categoryMix} />
              </div>
            </SectionCard>
          </div>

          {/* Busy Hour Heat & Narrative Summary */}
          <div className="mb-8 grid gap-8 xl:grid-cols-[1.4fr_1fr]">
            <SectionCard
              title="Dining Volume & Busy Hour Heatmap"
              subtitle="Demand concentration across meal hours to guide kitchen prep and staff allocation."
            >
              <div className="pt-2">
                <BusyHourChart data={report.busyHours} />
              </div>
            </SectionCard>

            <SectionCard
              title="Executive Narrative Summary"
              subtitle="Automated analytical takeaways generated from live data."
            >
              <div className="space-y-3 pt-1">
                {report.narrative.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl border border-brand-100/80 bg-white/95 p-4 shadow-sm"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/80">
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <p className="text-xs leading-relaxed text-stone-700 font-medium">{line}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Top Restaurants & Top Selling Dishes */}
          <div className="grid gap-8 xl:grid-cols-[1.3fr_1fr]">
            <SectionCard
              title="Top Performing Branches"
              subtitle="Branch ranking by gross revenue and guest table reservations."
            >
              <div className="space-y-3.5 pt-1">
                {report.topRestaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.name}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-brand-100/80 bg-white/95 p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 font-bold text-brand-700 text-xs shadow-inner border border-brand-100">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-stone-900">{restaurant.name}</p>
                        <p className="text-xs text-stone-500">
                          {restaurant.bookings} bookings • Rating: {restaurant.rating} ★
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 text-sm">
                      INR {restaurant.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Top Menu Movers"
              subtitle="High-velocity dishes suitable for menu promotion banners."
            >
              <div className="space-y-3 pt-1">
                {report.topItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-2xl border border-brand-100/70 bg-white/95 p-3.5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 font-bold text-amber-700 text-xs">
                        #{index + 1}
                      </span>
                      <p className="text-sm font-bold text-stone-900">{item.name}</p>
                    </div>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      {item.orders} ordered
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ReportsPage;
