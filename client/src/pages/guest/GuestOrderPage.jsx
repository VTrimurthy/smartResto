import { CheckCircle2, ChevronRight, Minus, Plus, Search, ShoppingBag, Sparkles, Store, UtensilsCrossed } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import SectionCard from "../../components/ui/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { useApiQuery, useQueryClient } from "../../context/QueryClientContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/helpers";

const getOrderDefaults = (user) => ({
  customerName: user?.name || "",
  customerEmail: user?.email || "",
  customerPhone: user?.phone || "",
  orderType: "delivery",
});

const resolveRequestMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

const resolveRestaurants = (restaurants = [], menuItems = []) => {
  if (restaurants.length) {
    return restaurants;
  }

  return menuItems.reduce((collection, item) => {
    const restaurant = item.restaurant;
    const restaurantId = String(restaurant?._id || restaurant || "");

    if (!restaurantId || collection.some((entry) => String(entry._id) === restaurantId)) {
      return collection;
    }

    return [
      ...collection,
      {
        _id: restaurantId,
        name: restaurant?.name || "Restaurant",
      },
    ];
  }, []);
};

const GuestOrderPage = () => {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [cart, setCart] = useState([]);
  const [orderForm, setOrderForm] = useState(getOrderDefaults(user));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase());

  const restaurantsQuery = useApiQuery({
    queryKey: ["guest", "restaurants"],
    url: "/restaurants",
    staleTime: 60000,
  });
  const menuItemsQuery = useApiQuery({
    queryKey: ["guest", "menu-items"],
    url: "/menu-items",
    staleTime: 45000,
  });

  const restaurants = useMemo(
    () => resolveRestaurants(restaurantsQuery.data ?? [], menuItemsQuery.data ?? []),
    [menuItemsQuery.data, restaurantsQuery.data]
  );
  const menuItems = menuItemsQuery.data ?? [];
  const isLoading = restaurantsQuery.isLoading || menuItemsQuery.isLoading;
  const isRefreshing = restaurantsQuery.isFetching || menuItemsQuery.isFetching;
  const loadError = !restaurants.length && !menuItems.length ? "Unable to load the guest ordering menu right now. Please retry." : "";

  useEffect(() => {
    if (!user) {
      return;
    }

    setOrderForm((current) => ({
      customerName: current.customerName || user.name || "",
      customerEmail: current.customerEmail || user.email || "",
      customerPhone: current.customerPhone || user.phone || "",
      orderType: current.orderType || "delivery",
    }));
  }, [user]);

  useEffect(() => {
    setSelectedRestaurant((current) => {
      if (current && restaurants.some((restaurant) => String(restaurant._id) === String(current))) {
        return current;
      }

      return menuItems[0]?.restaurant?._id || restaurants[0]?._id || "";
    });
  }, [menuItems, restaurants]);

  const filteredMenu = useMemo(
    () =>
      menuItems.filter((item) => {
        const restaurantMatches = !selectedRestaurant || String(item.restaurant?._id || item.restaurant) === String(selectedRestaurant);
        const searchableText = [item.name, item.category, item.description, ...(item.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const searchMatches = !deferredSearch || searchableText.includes(deferredSearch);

        return restaurantMatches && searchMatches;
      }),
    [deferredSearch, menuItems, selectedRestaurant]
  );

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0), [cart]);

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem._id === item._id);

      if (existing) {
        return current.map((cartItem) =>
          cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart((current) =>
      current
        .map((item) => (item._id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const retryLoad = async () => {
    setError("");
    setMessage("");

    const results = await Promise.allSettled([restaurantsQuery.refetch(), menuItemsQuery.refetch()]);

    if (results.every((result) => result.status === "rejected")) {
      pushToast({
        tone: "error",
        title: "Refresh failed",
        message: "The guest ordering menu is still unavailable. Please retry in a moment.",
      });
      return;
    }

    pushToast({
      tone: "info",
      title: "Menu refreshed",
      message: "The latest restaurant and menu data has been loaded.",
      duration: 2200,
    });
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!cart.length) {
      setError("Add at least one menu item before placing the order.");
      return;
    }

    if (!String(orderForm.customerName).trim() || !String(orderForm.customerEmail).trim() || !String(orderForm.customerPhone).trim()) {
      setError("Enter the customer name, email, and phone before placing the order.");
      return;
    }

    const restaurantId = selectedRestaurant || cart[0]?.restaurant?._id || cart[0]?.restaurant;

    if (!restaurantId) {
      setError("Choose a restaurant before placing the order.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/orders", {
        restaurant: restaurantId,
        customerName: String(orderForm.customerName).trim(),
        customerEmail: String(orderForm.customerEmail).trim(),
        customerPhone: String(orderForm.customerPhone).trim(),
        orderType: orderForm.orderType,
        items: cart.map((item) => ({
          menuItem: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        notes: "Created from guest ordering page",
      });

      queryClient.invalidateQueries("orders");
      pushToast({
        tone: "success",
        title: "Order placed",
        message: "The order was sent to the restaurant team successfully.",
      });
      setMessage("Order placed successfully. It is now visible in the orders workspace.");
      startTransition(() => {
        setCart([]);
        setOrderForm(getOrderDefaults(user));
      });
    } catch (requestError) {
      const messageText = resolveRequestMessage(requestError, "Unable to place the order.");
      setError(messageText);
      pushToast({
        tone: "error",
        title: "Order failed",
        message: messageText,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200/90 bg-white/95 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.26em] text-brand-700 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            <span>Gourmet Delivery & Dine-In</span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 md:text-6xl">
            Order Food from the Guest Portal
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
            Freshly prepared culinary creations directly synced with kitchen availability. Customize orders and track live progress.
          </p>

          {user?.role === "guest" && (
            <div className="mt-4">
              <Link
                to="/my-activity"
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-700 shadow-sm transition hover:bg-brand-500 hover:text-white"
              >
                <span>Track My Active Orders</span>
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              </Link>
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm font-semibold text-emerald-800 shadow-sm animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {(error || loadError) && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm font-medium text-rose-700 md:flex-row md:items-center md:justify-between shadow-sm animate-in fade-in">
            <span>{error || loadError || "Unable to load the guest ordering menu right now. Please retry."}</span>
            <button
              type="button"
              onClick={retryLoad}
              className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-100 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="mb-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="input-shell pl-11"
              placeholder="Search dishes, signature recipes, flavors, or categories..."
            />
          </div>

          <div className="relative">
            <select
              value={selectedRestaurant}
              onChange={(event) => setSelectedRestaurant(event.target.value)}
              className="input-shell font-semibold"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between text-xs text-stone-500 border-b border-brand-100/60 pb-3">
          <p className="font-semibold">{filteredMenu.length} dishes ready for this restaurant.</p>
          <p className="font-medium">{isRefreshing ? "Syncing kitchen menu..." : "Live menu synced with branch."}</p>
        </div>

        {/* Main Grid: Menu Catalogue + Floating Cart */}
        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          {/* Menu Items */}
          <SectionCard
            title="Culinary Menu"
            subtitle="Select signature dishes, desserts, or beverages to add to your order."
          >
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm">
                    <div className="h-48 animate-pulse bg-stone-100" />
                    <div className="space-y-3 p-5">
                      <div className="h-5 w-2/3 animate-pulse rounded-full bg-stone-100" />
                      <div className="h-4 w-full animate-pulse rounded-full bg-stone-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMenu.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredMenu.map((item) => (
                  <article
                    key={item._id}
                    className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-brand-100/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl"
                  >
                    <div>
                      {item.image ? (
                        <div className="relative overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 right-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                                item.isVeg
                                  ? "bg-emerald-500/90 text-white"
                                  : "bg-rose-500/90 text-white"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              <span>{item.isVeg ? "Veg" : "Non-Veg"}</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-brand-100 via-white to-amber-50 px-6 text-center">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-brand-600">{item.category}</p>
                            <p className="mt-2 font-display text-2xl font-bold text-stone-900">{item.name}</p>
                          </div>
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-600 transition">
                            {item.name}
                          </h3>
                        </div>
                        <p className="mt-1 text-xs text-brand-600 font-semibold">{item.category}</p>
                        <p className="mt-2 text-xs leading-relaxed text-stone-600 line-clamp-2">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-brand-100/50 p-5 pt-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400">Price</span>
                        <p className="text-lg font-bold text-stone-900">{formatCurrency(item.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="btn-primary py-2 px-5 text-xs font-bold"
                        aria-label={`Add ${item.name} to cart`}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-stone-200 bg-stone-50/70 p-12 text-center">
                <UtensilsCrossed className="mx-auto h-8 w-8 text-stone-300" />
                <p className="mt-3 text-base font-bold text-stone-800">No dishes match your filter criteria.</p>
                <p className="mt-1 text-xs text-stone-500">Try searching for other ingredients or categories.</p>
              </div>
            )}
          </SectionCard>

          {/* Floating Cart & Checkout Panel */}
          <div className="space-y-6">
            <SectionCard
              title="Your Order Cart"
              subtitle="Review items and delivery preferences."
              action={
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600 shadow-sm">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              }
            >
              <div className="space-y-4">
                {cart.length ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-brand-100/80 bg-white/95 p-3.5 shadow-sm"
                      >
                        <div className="truncate pr-2">
                          <p className="text-sm font-bold text-stone-900 truncate">{item.name}</p>
                          <p className="text-xs text-brand-600 font-semibold">{formatCurrency(item.price)} each</p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-brand-200/80 bg-brand-50/60 px-2 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, -1)}
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-stone-600 shadow-sm hover:text-brand-600 transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-stone-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, 1)}
                            aria-label={`Increase quantity for ${item.name}`}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-stone-600 shadow-sm hover:text-brand-600 transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-brand-200/80 bg-brand-50/40 p-8 text-center">
                    <ShoppingBag className="mx-auto h-7 w-7 text-brand-400 opacity-60" />
                    <p className="mt-2 text-sm font-bold text-stone-800">Your order cart is empty</p>
                    <p className="mt-1 text-xs text-stone-500">Add signature dishes from the menu to proceed.</p>
                  </div>
                )}

                {/* Total Display */}
                <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-brand-950 p-5 text-white shadow-md">
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span>Order Subtotal</span>
                    <span className="font-bold text-white">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Total Payable</span>
                    <h3 className="font-display text-3xl font-bold">{formatCurrency(cartTotal)}</h3>
                  </div>
                </div>

                {/* Guest Details & Submit Form */}
                <form onSubmit={submitOrder} className="space-y-3.5 pt-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-600">Customer Name</label>
                    <input
                      value={orderForm.customerName}
                      onChange={(event) => setOrderForm((current) => ({ ...current, customerName: event.target.value }))}
                      className="input-shell"
                      placeholder="e.g. Vikram Sharma"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-600">Email Address</label>
                    <input
                      type="email"
                      value={orderForm.customerEmail}
                      onChange={(event) => setOrderForm((current) => ({ ...current, customerEmail: event.target.value }))}
                      className="input-shell"
                      placeholder="vikram@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-600">Contact Number</label>
                    <input
                      value={orderForm.customerPhone}
                      onChange={(event) => setOrderForm((current) => ({ ...current, customerPhone: event.target.value }))}
                      className="input-shell"
                      placeholder="+91 99887 76655"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-600">Fulfillment Type</label>
                    <select
                      value={orderForm.orderType}
                      onChange={(event) => setOrderForm((current) => ({ ...current, orderType: event.target.value }))}
                      className="input-shell font-semibold"
                    >
                      <option value="delivery">Home Delivery</option>
                      <option value="takeaway">Branch Takeaway</option>
                      <option value="dine-in">Dine-In Table Service</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !cart.length}
                    className="btn-primary w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-brand-500/25"
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </button>
                </form>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuestOrderPage;
