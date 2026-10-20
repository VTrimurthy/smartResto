import { Calendar, CheckCircle2, Clock, MapPin, PencilLine, ShoppingBag, Sparkles, Table2, Trash2, Users, UtensilsCrossed } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import FormField from "../../components/ui/FormField";
import LoadingScreen from "../../components/ui/LoadingScreen";
import Modal from "../../components/ui/Modal";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { moduleConfigs } from "../../data/moduleConfigs";
import { formatCurrency, formatDate, formatTime } from "../../utils/helpers";

const guestConfigMap = {
  bookings: {
    ...moduleConfigs.bookings,
    fields: moduleConfigs.bookings.fields.filter((field) => field.name !== "status"),
  },
  reservations: {
    ...moduleConfigs.reservations,
    fields: moduleConfigs.reservations.fields.filter((field) => field.name !== "status"),
  },
  orders: {
    ...moduleConfigs.orders,
    fields: moduleConfigs.orders.fields.filter((field) => !["status", "paymentStatus", "discount"].includes(field.name)),
  },
};

const GuestActivityPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState({ bookings: [], reservations: [], orders: [] });
  const [dependencies, setDependencies] = useState({ restaurants: [], tables: [], menuItems: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formValues, setFormValues] = useState({});

  const loadData = useCallback(async () => {
    if (!user || user.role !== "guest") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [bookingsResponse, reservationsResponse, ordersResponse, restaurantsResponse, tablesResponse, menuItemsResponse] =
        await Promise.all([
          api.get("/bookings"),
          api.get("/reservations"),
          api.get("/orders"),
          api.get("/restaurants"),
          api.get("/tables"),
          api.get("/menu-items"),
        ]);

      setRecords({
        bookings: bookingsResponse.data,
        reservations: reservationsResponse.data,
        orders: ordersResponse.data,
      });
      setDependencies({
        restaurants: restaurantsResponse.data,
        tables: tablesResponse.data,
        menuItems: menuItemsResponse.data,
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your guest activity.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(
    () => [
      { title: "Table Bookings", value: records.bookings.length, subtitle: "Confirmed & pending table slots", icon: Table2 },
      { title: "Reservations", value: records.reservations.length, subtitle: "Scheduled advance dining dates", icon: Calendar },
      { title: "Food Orders", value: records.orders.length, subtitle: "Total placed kitchen orders", icon: ShoppingBag },
    ],
    [records]
  );

  const openEditModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setFormValues(guestConfigMap[type].toFormValues(item, dependencies));
  };

  const closeModal = () => {
    setModalType("");
    setSelectedItem(null);
    setFormValues({});
  };

  const handleFieldChange = (name, value) => {
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const config = guestConfigMap[modalType];
      const payload = config.fromFormValues(formValues, dependencies, selectedItem, user);
      await api.put(`${config.endpoint}/${selectedItem._id}`, payload);
      setMessage("Your record was updated successfully.");
      closeModal();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update your record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, item) => {
    const config = guestConfigMap[type];
    const confirmed = window.confirm(`Delete this ${type.slice(0, -1)} from your activity?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`${config.endpoint}/${item._id}`);
      setMessage("The record was deleted successfully.");
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this record.");
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen label="Loading your guest activity..." />;
  }

  if (!user) {
    return (
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-xl text-center">
          <div className="glass-panel p-8">
            <UtensilsCrossed className="mx-auto h-12 w-12 text-brand-500 mb-4" />
            <h2 className="font-display text-3xl font-bold text-stone-900">Sign In Required</h2>
            <p className="mt-2 text-sm text-stone-600 mb-6">
              Sign in with your guest account to manage and track your bookings, reservations, and orders.
            </p>
            <Link to="/login" className="btn-primary w-full justify-center">
              Login to Guest Portal
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (user.role !== "guest") {
    return (
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-xl text-center">
          <div className="glass-panel p-8">
            <h2 className="font-display text-3xl font-bold text-stone-900">Operations Team Portal</h2>
            <p className="mt-2 text-sm text-stone-600 mb-6">
              You are signed in with an administrative staff role ({user.role}). Full branch operations are managed from the executive dashboard.
            </p>
            <Link to="/dashboard" className="btn-primary w-full justify-center">
              Enter Operations Dashboard
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-6 py-12 md:px-10 md:py-20">
      {/* Background radial ambiance */}
      <div className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-brand-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-40 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200/90 bg-white/95 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.26em] text-brand-700 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            <span>Guest Activity Central</span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 md:text-6xl">
            My Dining Journey & Orders
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
            Real-time status tracking and controls for all your active table reservations, advance bookings, and live kitchen orders.
          </p>
        </div>

        {/* Global Feedback Notifications */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm font-semibold text-emerald-800 shadow-sm animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm font-semibold text-rose-800 shadow-sm animate-in fade-in">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800 text-xs font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Top Summary Stat Cards */}
        <div className="mb-10 grid gap-5 md:grid-cols-3">
          {stats.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} subtitle={item.subtitle} icon={item.icon} />
          ))}
        </div>

        {/* Triple Section Panels: Bookings, Reservations, Orders */}
        <div className="space-y-10">
          {/* Table Bookings */}
          <SectionCard
            title="My Table Bookings"
            subtitle="Immediate table bookings assigned to restaurant branches."
            action={
              <Link to="/book-table" className="btn-secondary py-2 text-xs">
                + New Booking
              </Link>
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              {records.bookings.length ? (
                records.bookings.map((item) => (
                  <div
                    key={item._id}
                    className="glass-panel group relative overflow-hidden p-6 transition duration-300 hover:border-brand-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-brand-100/60 pb-4">
                      <div>
                        <p className="font-bold text-stone-900 text-lg group-hover:text-brand-600 transition">
                          {item.restaurant?.name || "Branch"}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                          <Clock className="h-3.5 w-3.5 text-brand-500" />
                          <span>{formatDate(item.bookingDate)} at {formatTime(item.timeSlot)}</span>
                        </p>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-600">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
                        <Users className="h-3 w-3" />
                        <span>{item.guestCount} Guests</span>
                      </span>
                      {item.table && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 font-semibold text-stone-700">
                          <Table2 className="h-3 w-3" />
                          <span>Table {item.table?.tableNumber || item.table}</span>
                        </span>
                      )}
                      <span className="text-stone-500 italic">{item.occasion || "Standard Dining"}</span>
                    </div>

                    {item.specialRequest && (
                      <p className="mt-3 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-600 italic">
                        "{item.specialRequest}"
                      </p>
                    )}

                    <div className="mt-5 flex gap-2 border-t border-brand-100/50 pt-4">
                      <button
                        type="button"
                        onClick={() => openEditModal("bookings", item)}
                        className="btn-secondary flex-1 py-2 text-xs"
                      >
                        <PencilLine className="mr-1.5 h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete("bookings", item)}
                        className="flex-1 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                      >
                        <Trash2 className="mr-1.5 inline h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 p-8 text-center md:col-span-2">
                  <p className="text-sm font-semibold text-stone-700">No active table bookings found.</p>
                  <p className="mt-1 text-xs text-stone-400">Reserve a table anytime from the booking module.</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Advance Reservations */}
          <SectionCard
            title="Advance Reservations"
            subtitle="Scheduled dining reservations with preferred dining areas."
            action={
              <Link to="/book-table" className="btn-secondary py-2 text-xs">
                + New Reservation
              </Link>
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              {records.reservations.length ? (
                records.reservations.map((item) => (
                  <div
                    key={item._id}
                    className="glass-panel group relative overflow-hidden p-6 transition duration-300 hover:border-brand-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-brand-100/60 pb-4">
                      <div>
                        <p className="font-bold text-stone-900 text-lg group-hover:text-brand-600 transition">
                          {item.restaurant?.name || "Branch"}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-brand-500" />
                          <span>{formatDate(item.reservationDate)} at {formatTime(item.timeSlot)}</span>
                        </p>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-600">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
                        <Users className="h-3 w-3" />
                        <span>{item.guestCount} Guests</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 font-semibold text-stone-700">
                        <MapPin className="h-3 w-3" />
                        <span>{item.areaPreference || "Indoor Dining"}</span>
                      </span>
                    </div>

                    {item.specialRequest && (
                      <p className="mt-3 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-600 italic">
                        "{item.specialRequest}"
                      </p>
                    )}

                    <div className="mt-5 flex gap-2 border-t border-brand-100/50 pt-4">
                      <button
                        type="button"
                        onClick={() => openEditModal("reservations", item)}
                        className="btn-secondary flex-1 py-2 text-xs"
                      >
                        <PencilLine className="mr-1.5 h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete("reservations", item)}
                        className="flex-1 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                      >
                        <Trash2 className="mr-1.5 inline h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 p-8 text-center md:col-span-2">
                  <p className="text-sm font-semibold text-stone-700">No advance reservations scheduled.</p>
                  <p className="mt-1 text-xs text-stone-400">Plan ahead for upcoming occasions or gatherings.</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Kitchen Orders */}
          <SectionCard
            title="My Food Orders"
            subtitle="Track kitchen preparation and delivery status in real-time."
            action={
              <Link to="/order-online" className="btn-secondary py-2 text-xs">
                + Order More
              </Link>
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              {records.orders.length ? (
                records.orders.map((item) => (
                  <div
                    key={item._id}
                    className="glass-panel group relative overflow-hidden p-6 transition duration-300 hover:border-brand-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-brand-100/60 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs font-bold text-brand-600 uppercase tracking-wider">{item.orderNumber}</p>
                          <span className="text-stone-300">•</span>
                          <span className="text-xs font-semibold uppercase text-stone-500">{item.orderType}</span>
                        </div>
                        <p className="mt-1 font-bold text-stone-900">{item.restaurant?.name || "Restaurant"}</p>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>

                    <div className="mt-4 space-y-1.5">
                      {(item.items || []).map((orderItem, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-stone-600">
                          <span className="font-medium">{orderItem.name} × {orderItem.quantity}</span>
                          <span className="font-semibold text-stone-800">{formatCurrency(orderItem.price * orderItem.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-brand-100/60 pt-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400">Total</span>
                        <p className="text-lg font-bold text-brand-600">{formatCurrency(item.totalAmount)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal("orders", item)}
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          <PencilLine className="mr-1 h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete("orders", item)}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 p-8 text-center md:col-span-2">
                  <p className="text-sm font-semibold text-stone-700">No active food orders found.</p>
                  <p className="mt-1 text-xs text-stone-400">Order from our live gourmet menu anytime.</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Edit Modal */}
        <Modal
          open={Boolean(modalType && selectedItem)}
          onClose={closeModal}
          title={modalType ? `Edit ${guestConfigMap[modalType].title}` : "Edit"}
          subtitle="Update your record and synchronize with restaurant operations."
        >
          {modalType ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {guestConfigMap[modalType].fields.map((field) => (
                  <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                    <FormField
                      field={field}
                      value={formValues[field.name]}
                      onChange={handleFieldChange}
                      dependencies={dependencies}
                      formValues={formValues}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-brand-100/60 pt-5">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : null}
        </Modal>
      </div>
    </section>
  );
};

export default GuestActivityPage;
