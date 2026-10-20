import { Bot, BotMessageSquare, LifeBuoy, MessagesSquare, Send, Sparkles, User } from "lucide-react";
import { useState } from "react";

import api from "../../api/client";
import SectionCard from "../../components/ui/SectionCard";

const faqs = [
  "How do I book a table for tonight?",
  "Can you recommend vegetarian dishes under INR 400?",
  "What are the restaurant opening hours?",
  "How do I track my online order?",
];

const SupportPage = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState([
    {
      from: "bot",
      text: "Hello! I am your Dineazy AI Concierge. Ask me about table bookings, menu recommendations, branch timings, or order assistance.",
    },
  ]);

  const askChatbot = async (input) => {
    if (!input.trim() || isTyping) {
      return;
    }

    setConversation((current) => [...current, { from: "user", text: input }]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await api.post("/ai/chatbot", { message: input });
      setConversation((current) => [...current, { from: "bot", text: response.data.reply }]);
    } catch (error) {
      setConversation((current) => [
        ...current,
        { from: "bot", text: "The AI concierge is temporarily taking a breather. Please try again in a moment." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section className="relative overflow-hidden px-6 py-12 md:px-10 md:py-20">
      {/* Background radial ambiance */}
      <div className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-brand-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="mx-auto max-w-6xl">
        {/* Page Title */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200/90 bg-white/95 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.26em] text-brand-700 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            <span>24/7 AI Assistance</span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 md:text-6xl">
            Customer Support Concierge
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
            Real-time conversational intelligence for dining queries, table reservations, dietary questions, and branch assistance.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          {/* Left Column: Quick Features & Prompts */}
          <div className="space-y-6">
            <SectionCard
              title="Concierge Capabilities"
              subtitle="Intelligent assistance connected with live branch operations."
            >
              <div className="space-y-4">
                {[
                  {
                    icon: BotMessageSquare,
                    title: "Live Operations Context",
                    text: "Answers queries using real branch menus, current operating hours, and active reservation rules.",
                  },
                  {
                    icon: LifeBuoy,
                    title: "Always Available",
                    text: "Instant responses 24/7 without waiting on phone lines or waiting for branch staff availability.",
                  },
                  {
                    icon: MessagesSquare,
                    title: "Smart Flavor Suggestions",
                    text: "Can recommend spicy, vegetarian, or budget-friendly dishes tailored to your preferences.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-2xl border border-brand-100/80 bg-white/90 p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600 shadow-sm">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-stone-500">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample Prompts */}
              <div className="mt-6 border-t border-brand-100/60 pt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">Popular Quick Queries</p>
                <div className="space-y-2">
                  {faqs.map((faq) => (
                    <button
                      key={faq}
                      type="button"
                      onClick={() => askChatbot(faq)}
                      className="group flex w-full items-center justify-between rounded-xl border border-brand-100/80 bg-white/80 px-4 py-2.5 text-left text-xs font-semibold text-stone-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 cursor-pointer"
                    >
                      <span>{faq}</span>
                      <Send className="h-3 w-3 text-brand-400 opacity-0 transition group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right Column: Interactive Chat Interface */}
          <SectionCard
            title="Live Dining Assistant"
            subtitle="Chat directly with the AI concierge about your dining needs."
            action={
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </div>
            }
          >
            <div className="rounded-[28px] border border-brand-100/90 bg-gradient-to-br from-stone-50/70 via-white to-brand-50/40 p-5 shadow-inner">
              {/* Message History */}
              <div className="mb-4 h-[440px] space-y-3.5 overflow-y-auto pr-2">
                {conversation.map((entry, index) => (
                  <div
                    key={`${entry.from}-${index}`}
                    className={`flex items-start gap-2.5 ${entry.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {entry.from === "bot" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        entry.from === "user"
                          ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium"
                          : "border border-brand-100/80 bg-white/95 text-stone-800"
                      }`}
                    >
                      {entry.text}
                    </div>

                    {entry.from === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-800 text-white shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-stone-400 italic">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                      <Bot className="h-3.5 w-3.5" />
                    </span>
                    <span>AI Concierge is typing...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  askChatbot(message);
                }}
                className="flex gap-2.5 pt-2"
              >
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="input-shell flex-1"
                  placeholder="Ask about table booking, menu dishes, branch hours..."
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isTyping}
                  className="btn-primary px-6 font-bold shadow-md shadow-brand-500/25"
                >
                  <Send className="mr-1.5 h-4 w-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  );
};

export default SupportPage;
