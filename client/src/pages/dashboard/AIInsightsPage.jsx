import { Bot, ChefHat, Clock3, Flame, MessageSquare, Send, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import api from "../../api/client";
import BusyHourChart from "../../components/charts/BusyHourChart";
import PageHeader from "../../components/layout/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { formatCurrency } from "../../utils/helpers";

const AIInsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [recommendationForm, setRecommendationForm] = useState({
    restaurant: "",
    preference: "",
    budget: "",
    isVeg: false,
    spiceLevel: "",
  });
  const [recommendationResult, setRecommendationResult] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I am the Dineazy Operations AI Assistant. Ask about branch timings, menu pairing recommendations, booking status, or floor service rules.",
    },
  ]);
  const [error, setError] = useState("");
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [insightResponse, restaurantResponse] = await Promise.all([api.get("/ai/insights"), api.get("/restaurants")]);
        setInsights(insightResponse.data);
        setRestaurants(restaurantResponse.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load AI insights.");
      }
    };

    loadData();
  }, []);

  const quickCards = useMemo(
    () => [
      { title: "Decision Modules", value: 3, subtitle: "Flavor matching, support engine & peak forecast", icon: Clock3 },
      { title: "Service Signals", value: insights?.insights?.length || 0, subtitle: "Operational alerts from orders & reservations", icon: ChefHat },
      { title: "Action Directives", value: insights?.suggestions?.length || 0, subtitle: "Immediate table turnover suggestions", icon: Bot },
    ],
    [insights]
  );

  const handleRecommendationChange = (event) => {
    const { name, value, type, checked } = event.target;
    setRecommendationForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRecommendationSubmit = async (event) => {
    event.preventDefault();
    setLoadingRecs(true);
    try {
      const response = await api.post("/ai/recommendations", {
        ...recommendationForm,
        budget: recommendationForm.budget ? Number(recommendationForm.budget) : undefined,
      });
      setRecommendationResult(response.data.recommendations);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to generate recommendations.");
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();

    if (!chatInput.trim()) {
      return;
    }

    const userMessage = { from: "user", text: chatInput };
    setMessages((current) => [...current, userMessage]);
    setChatInput("");

    try {
      const response = await api.post("/ai/chatbot", { message: userMessage.text });
      setMessages((current) => [...current, { from: "bot", text: response.data.reply }]);
    } catch (requestError) {
      setMessages((current) => [
        ...current,
        { from: "bot", text: requestError.response?.data?.message || "Sorry, the chatbot is temporarily unavailable." },
      ]);
    }
  };

  if (!insights && !error) {
    return <LoadingScreen label="Loading AI intelligence engines..." />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Artificial Intelligence"
        title="Hospitality Intelligence Suite"
        description="Predictive demand forecasting, guest taste recommendations, and automated service assistance for kitchen and front-of-house teams."
      />

      {error ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm font-medium text-rose-700 shadow-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800 text-xs font-bold">!</span>
          <span>{error}</span>
        </div>
      ) : null}

      {/* Top 3 Metric Cards */}
      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quickCards.map((card) => (
          <StatCard key={card.title} title={card.title} value={card.value} subtitle={card.subtitle} icon={card.icon} />
        ))}
      </div>

      {insights ? (
        <>
          {/* Demand Signal Row */}
          <div className="mb-8 grid gap-8 xl:grid-cols-[1.3fr_1fr]">
            <SectionCard
              title="Demand Traffic Concentration"
              subtitle="Predictive busy hour model computed from historical bookings and live orders."
            >
              <div className="pt-2">
                <BusyHourChart data={insights.busyHours} />
              </div>
            </SectionCard>

            <SectionCard
              title="Operational Signals & Shift Brief"
              subtitle="Automated shift briefing insights for managers."
            >
              <div className="space-y-3.5 pt-1">
                {insights.insights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-brand-100/90 bg-gradient-to-br from-white to-brand-50/40 p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-900">{item.title}</p>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-stone-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Recommendation Desk + Live Chatbot Console */}
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Recommendation Generator */}
            <SectionCard
              title="Culinary Recommendation Engine"
              subtitle="Generate customized dish proposals by budget, spice profile, and dietary criteria."
              action={
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600 shadow-sm">
                  <Wand2 className="h-5 w-5" />
                </div>
              }
            >
              <form onSubmit={handleRecommendationSubmit} className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Restaurant Branch</label>
                  <select
                    name="restaurant"
                    value={recommendationForm.restaurant}
                    onChange={handleRecommendationChange}
                    className="input-shell"
                  >
                    <option value="">All Branches</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Flavor / Keyword Preference</label>
                  <input
                    name="preference"
                    value={recommendationForm.preference}
                    onChange={handleRecommendationChange}
                    className="input-shell"
                    placeholder="e.g. signature, truffle, paneer, crispy"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Max Budget (INR)</label>
                  <input
                    name="budget"
                    type="number"
                    value={recommendationForm.budget}
                    onChange={handleRecommendationChange}
                    className="input-shell"
                    placeholder="e.g. 500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Spice Preference</label>
                  <select
                    name="spiceLevel"
                    value={recommendationForm.spiceLevel}
                    onChange={handleRecommendationChange}
                    className="input-shell"
                  >
                    <option value="">Any Spice Level</option>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot 🔥</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Vegetarian Dishes Only</span>
                  <input
                    name="isVeg"
                    type="checkbox"
                    checked={recommendationForm.isVeg}
                    onChange={handleRecommendationChange}
                    className="h-5 w-5 rounded border-brand-300 text-brand-600 focus:ring-brand-400 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingRecs}
                  className="btn-primary md:col-span-2 py-3 text-sm font-bold shadow-md shadow-brand-500/25"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>{loadingRecs ? "Computing Matches..." : "Compute Recommendations"}</span>
                </button>
              </form>

              {/* Recommendation Results */}
              {recommendationResult.length > 0 && (
                <div className="mt-6 border-t border-brand-100/60 pt-5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-brand-700">
                    Recommended Culinary Matches ({recommendationResult.length})
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {recommendationResult.map((item) => (
                      <div
                        key={item._id}
                        className="group overflow-hidden rounded-2xl border border-brand-100/80 bg-white/95 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                      >
                        {item.image && (
                          <img src={item.image} alt={item.name} className="h-36 w-full object-cover group-hover:scale-105 transition" />
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-stone-900 text-sm group-hover:text-brand-600 transition">{item.name}</p>
                              <p className="text-[11px] text-stone-400">{item.restaurant}</p>
                            </div>
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 border border-brand-200/60">
                              {item.spiceLevel || "Normal"}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-stone-600 leading-relaxed">{item.reason}</p>
                          <p className="mt-3 font-bold text-stone-900 text-sm">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Guest Support & Chatbot Console */}
            <SectionCard
              title="Live AI Operations Chatbot"
              subtitle="Test staff and guest conversational replies in real time."
              action={
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </div>
              }
            >
              {/* Chat Message Window */}
              <div className="space-y-3 rounded-2xl border border-brand-100/90 bg-gradient-to-b from-brand-50/40 via-white to-white p-4">
                <div className="h-[340px] space-y-3 overflow-y-auto pr-1">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.from}-${index}`}
                      className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                          message.from === "user"
                            ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium"
                            : "border border-brand-100 bg-white text-stone-800"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleChatSubmit} className="flex gap-2 pt-2 border-t border-brand-100/60">
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    className="input-shell flex-1 text-xs"
                    placeholder="Ask about table reservations, kitchen items, branch hours..."
                  />
                  <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold shadow-sm">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>

              {/* Actionable Suggestions */}
              <div className="mt-5 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Tactical Directives</p>
                {insights.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-brand-100/80 bg-brand-50/50 p-3 text-xs leading-relaxed text-stone-700 font-medium"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-200/80 font-bold text-brand-800 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{suggestion}</span>
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

export default AIInsightsPage;
