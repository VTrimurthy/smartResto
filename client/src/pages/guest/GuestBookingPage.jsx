import { Calendar, CalendarCheck2, CheckCircle2, Clock4, Compass, Mail, Phone, Sparkles, Table2, User, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import SectionCard from "../../components/ui/SectionCard";
import { useAuth } from "../../context/AuthContext";

const initialBookingState = {
  restaurant: "",
  table: "",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  bookingDate: "",
  timeSlot: "",
  guestCount: 2,
  occasion: "",
  specialRequest: "",
};

const initialReservationState = {
  restaurant: "",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  reservationDate: "",
  timeSlot: "",
  guestCount: 2,
  areaPreference: "",
  specialRequest: "",
};

const getBookingDefaults = (user) => ({
  ...initialBookingState,
  guestName: user?.name || "",
  guestEmail: user?.email || "",
  guestPhone: user?.phone || "",
});

const getReservationDefaults = (user) => ({
  ...initialReservationState,
  guestName: user?.name || "",
  guestEmail: user?.email || "",
  guestPhone: user?.phone || "",
});

const GuestBookingPage = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState("booking"); // 'booking' | 'reservation'
  const [bookingForm, setBookingForm] = useState(getBookingDefaults(user));
  const [reservationForm, setReservationForm] = useState(getReservationDefaults(user));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [restaurantResponse, tableResponse] = await Promise.all([api.get("/restaurants"), api.get("/tables")]);
      setRestaurants(restaurantResponse.data);
      setTables(tableResponse.data);
    };

    loadData().catch(() => setError("Unable to load restaurants and tables for booking."));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setBookingForm((current) => ({ ...getBookingDefaults(user), ...current }));
    setReservationForm((current) => ({ ...getReservationDefaults(user), ...current }));
  }, [user]);

  const availableTables = useMemo(
    () =>
      tables.filter(
        (table) => (!bookingForm.restaurant || String(table.restaurant?._id || table.restaurant) === String(bookingForm.restaurant)) && table.isAvailable
      ),
    [bookingForm.restaurant, tables]
  );

  const handleBookingChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((current) => ({ ...current, [name]: value }));
  };

  const handleReservationChange = (event) => {
    const { name, value } = event.target;
    setReservationForm((current) => ({ ...current, [name]: value }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await api.post("/bookings", { ...bookingForm, status: "pending", source: "web", guestCount: Number(bookingForm.guestCount) });
      setMessage("Table booking submitted successfully! Your request is now active and tracked.");
      setBookingForm(getBookingDefaults(user));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReservation = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await api.post("/reservations", {
        ...reservationForm,
        status: "pending",
        guestCount: Number(reservationForm.guestCount),
      });
      setMessage("Advance reservation created successfully! It is now scheduled in our executive system.");
      setReservationForm(getReservationDefaults(user));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden px-6 py-12 md:px-10 md:py-20">
      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute -right-20 top-20 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-40 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200/90 bg-white/95 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.26em] text-brand-700 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            <span>VIP Dining Concierge</span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 md:text-6xl">
            Book a Table & Gourmet Reservations
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
            Select your preferred dining branch, date, guest count, and seating area. Our restaurant teams manage every detail with instant confirmations.
          </p>

          {user?.role === "guest" && (
            <div className="mt-5">
              <Link
                to="/my-activity"
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-700 shadow-sm transition hover:bg-brand-500 hover:text-white"
              >
                <span>View & Manage My Active Bookings</span>
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              </Link>
            </div>
          )}
        </div>

        {/* Global Feedback Notifications */}
        {message && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm font-semibold text-emerald-800 shadow-sm animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm font-semibold text-rose-800 shadow-sm animate-in fade-in">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800 text-xs font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-2xl border border-brand-200/80 bg-brand-50/70 p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("booking")}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "booking"
                  ? "bg-white text-brand-700 shadow-md"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <CalendarCheck2 className="h-4 w-4" />
              <span>Direct Table Booking</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reservation")}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "reservation"
                  ? "bg-white text-brand-700 shadow-md"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Clock4 className="h-4 w-4" />
              <span>Advance Reservation</span>
            </button>
          </div>
        </div>

        {/* Direct Table Booking Form */}
        {activeTab === "booking" && (
          <div className="glass-panel mx-auto max-w-4xl p-7 md:p-10 shadow-xl shadow-brand-500/5 animate-in fade-in">
            <div className="mb-8 flex items-center justify-between border-b border-brand-100/70 pb-5">
              <div>
                <h2 className="font-display text-2xl font-bold text-stone-900 md:text-3xl">
                  Table Reservation Request
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Select a branch and table to reserve your spot right now.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600 shadow-sm">
                <Table2 className="h-6 w-6" />
              </div>
            </div>

            <form onSubmit={submitBooking} className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Restaurant Branch</label>
                <select
                  name="restaurant"
                  value={bookingForm.restaurant}
                  onChange={handleBookingChange}
                  className="input-shell"
                  required
                >
                  <option value="">Select a branch</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name} ({restaurant.address?.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Table Selection</label>
                <select
                  name="table"
                  value={bookingForm.table}
                  onChange={handleBookingChange}
                  className="input-shell"
                >
                  <option value="">Auto-assign best available table</option>
                  {availableTables.map((table) => (
                    <option key={table._id} value={table._id}>
                      Table {table.tableNumber} • {table.capacity} Guests ({table.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Guest Name</label>
                <input
                  name="guestName"
                  value={bookingForm.guestName}
                  onChange={handleBookingChange}
                  className="input-shell"
                  placeholder="e.g. Rahul Verma"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Email Address</label>
                <input
                  name="guestEmail"
                  type="email"
                  value={bookingForm.guestEmail}
                  onChange={handleBookingChange}
                  className="input-shell"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Contact Number</label>
                <input
                  name="guestPhone"
                  value={bookingForm.guestPhone}
                  onChange={handleBookingChange}
                  className="input-shell"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Guest Count</label>
                <input
                  name="guestCount"
                  type="number"
                  min="1"
                  max="20"
                  value={bookingForm.guestCount}
                  onChange={handleBookingChange}
                  className="input-shell"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Booking Date</label>
                <input
                  name="bookingDate"
                  type="date"
                  value={bookingForm.bookingDate}
                  onChange={handleBookingChange}
                  className="input-shell"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Time Slot</label>
                <input
                  name="timeSlot"
                  type="time"
                  value={bookingForm.timeSlot}
                  onChange={handleBookingChange}
                  className="input-shell"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Occasion (Optional)</label>
                <input
                  name="occasion"
                  value={bookingForm.occasion}
                  onChange={handleBookingChange}
                  className="input-shell"
                  placeholder="Birthday, Anniversary, Business Lunch, Family Dinner..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Special Instructions / Requests</label>
                <textarea
                  name="specialRequest"
                  value={bookingForm.specialRequest}
                  onChange={handleBookingChange}
                  className="input-shell min-h-[100px]"
                  placeholder="Seating preferences (e.g. window seat, high chair, dietary notices)..."
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-brand-500/25"
                >
                  {isSubmitting ? "Submitting Booking..." : "Confirm Table Booking"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Advance Reservation Form */}
        {activeTab === "reservation" && (
          <div className="glass-panel mx-auto max-w-4xl p-7 md:p-10 shadow-xl shadow-brand-500/5 animate-in fade-in">
            <div className="mb-8 flex items-center justify-between border-b border-brand-100/70 pb-5">
              <div>
                <h2 className="font-display text-2xl font-bold text-stone-900 md:text-3xl">
                  Advance Dining Reservation
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Plan ahead with custom area preferences (Patio, Indoor, Private Dining).
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600 shadow-sm">
                <Clock4 className="h-6 w-6" />
              </div>
            </div>

            <form onSubmit={submitReservation} className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Restaurant Branch</label>
                <select
                  name="restaurant"
                  value={reservationForm.restaurant}
                  onChange={handleReservationChange}
                  className="input-shell"
                  required
                >
                  <option value="">Select a branch</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name} ({restaurant.address?.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Party Size (Guests)</label>
                <input
                  name="guestCount"
                  type="number"
                  min="1"
                  max="30"
                  value={reservationForm.guestCount}
                  onChange={handleReservationChange}
                  className="input-shell"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Guest Name</label>
                <input
                  name="guestName"
                  value={reservationForm.guestName}
                  onChange={handleReservationChange}
                  className="input-shell"
                  placeholder="e.g. Priya Nair"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Email Address</label>
                <input
                  name="guestEmail"
                  type="email"
                  value={reservationForm.guestEmail}
                  onChange={handleReservationChange}
                  className="input-shell"
                  placeholder="priya@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Contact Number</label>
                <input
                  name="guestPhone"
                  value={reservationForm.guestPhone}
                  onChange={handleReservationChange}
                  className="input-shell"
                  placeholder="+91 98111 22334"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Area Preference</label>
                <input
                  name="areaPreference"
                  value={reservationForm.areaPreference}
                  onChange={handleReservationChange}
                  className="input-shell"
                  placeholder="Indoor / Outdoor Patio / Lounge / Garden"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Reservation Date</label>
                <input
                  name="reservationDate"
                  type="date"
                  value={reservationForm.reservationDate}
                  onChange={handleReservationChange}
                  className="input-shell"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Time Slot</label>
                <input
                  name="timeSlot"
                  type="time"
                  value={reservationForm.timeSlot}
                  onChange={handleReservationChange}
                  className="input-shell"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Special Dining Notes</label>
                <textarea
                  name="specialRequest"
                  value={reservationForm.specialRequest}
                  onChange={handleReservationChange}
                  className="input-shell min-h-[100px]"
                  placeholder="Allergies, candlelight setup, special anniversary celebration requests..."
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-brand-500/25"
                >
                  {isSubmitting ? "Submitting Reservation..." : "Submit Advance Reservation"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default GuestBookingPage;
