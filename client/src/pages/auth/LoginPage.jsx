import { ArrowRight, Clock3, KeyRound, Lock, ShieldCheck, Sparkles, User, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { demoAccounts } from "../../data/demoAccounts";

const getLocalApiMessage = () => {
  if (typeof window === "undefined") {
    return "The local API is not reachable right now. Please make sure the backend is running on 127.0.0.1:8080.";
  }

  return `The local API is not reachable right now. Please make sure the backend is running on ${window.location.hostname}:8080.`;
};

const resolveAuthErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (!error?.response) {
    return getLocalApiMessage();
  }

  return "Unable to complete authentication.";
};

const resolvePostAuthPath = (userRole, fromPath) => {
  if (userRole === "guest") {
    return "/book-table";
  }

  if (fromPath && fromPath.startsWith("/")) {
    return fromPath;
  }

  return "/dashboard";
};

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const requestedPath = location.state?.from;

  useEffect(() => {
    if (!user) {
      return;
    }

    navigate(resolvePostAuthPath(user.role, requestedPath), { replace: true });
  }, [navigate, requestedPath, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    if (!String(formValues.email).trim() || !String(formValues.password).trim()) {
      return "Enter your email and password to continue.";
    }

    if (mode === "register") {
      if (!String(formValues.name).trim()) {
        return "Enter the guest name to create an account.";
      }

      if (!String(formValues.phone).trim()) {
        return "Enter the guest phone number to create an account.";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      pushToast({
        tone: "error",
        title: "Check the form",
        message: validationMessage,
      });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const currentUser =
        mode === "login"
          ? await login({ email: formValues.email, password: formValues.password })
          : await register(formValues);

      const destination = resolvePostAuthPath(currentUser.role, requestedPath);
      pushToast({
        tone: "success",
        title: mode === "login" ? "Signed in" : "Account ready",
        message: mode === "login" ? "Your workspace is ready." : "Your guest account has been created successfully.",
      });
      navigate(destination, { replace: true });
    } catch (requestError) {
      const message = resolveAuthErrorMessage(requestError);
      setError(message);
      pushToast({
        tone: "error",
        title: mode === "login" ? "Sign-in failed" : "Registration failed",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const applyDemoAccount = (account) => {
    setMode("login");
    setError("");
    setFormValues((current) => ({
      ...current,
      email: account.email,
      password: account.password,
    }));
    pushToast({
      tone: "info",
      title: `${account.role} demo filled`,
      message: "The form has been prefilled with the selected demo account.",
      duration: 2200,
    });
  };

  return (
    <section className="relative overflow-hidden px-6 py-10 md:px-10 md:py-16">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-10 h-80 w-80 rounded-full bg-brand-300/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-8rem] h-96 w-96 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[78vh] max-w-6xl items-center gap-10 xl:grid-cols-[0.98fr_0.85fr]">
        {/* Left Side: Luxury Brand Showcase */}
        <div className="relative hidden overflow-hidden rounded-[36px] border border-brand-200/80 bg-gradient-to-br from-white via-[#fffaf5] to-[#ffeedb] p-9 text-stone-900 shadow-[0_30px_90px_rgba(249,115,22,0.14)] xl:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(254,215,170,0.38),transparent_32%)]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-amber-500 to-brand-600" />
          
          <div className="relative flex h-full min-h-[620px] flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-3.5 rounded-full border border-brand-200/70 bg-white/95 px-4 py-2 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-brand-100 bg-white p-1 shadow-sm">
                  <img src="/logo.png" alt="Dineazy Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold leading-none tracking-tight text-stone-900">
                    Dine<span className="text-brand-500">azy</span>
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-600">Good Food • Made Easy</p>
                </div>
              </div>

              <div className="mt-12 max-w-md">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-brand-700 shadow-sm">
                  <KeyRound className="h-3 w-3 text-brand-600" />
                  <span>Permanent JWT Session Active</span>
                </div>
                
                <h1 className="mt-5 font-display text-5xl font-bold leading-[0.98] tracking-tight text-stone-900 md:text-6xl">
                  Intelligent hospitality operations, seamlessly unified.
                </h1>
                <p className="mt-5 max-w-sm text-base leading-7 text-stone-600">
                  Role-based platform access for admins, restaurant teams, and guests with persistent session continuity and zero expiration interruptions.
                </p>
              </div>
            </div>

            {/* Platform Metrics Showcase */}
            <div className="grid gap-3.5 md:grid-cols-3">
              {[
                { value: "4", label: "Roles", note: "Multi-Role RBAC" },
                { value: "PERM", label: "Non-Expiring", note: "Permanent JWT" },
                { value: "24/7", label: "Access", note: "Realtime Portal" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[26px] border border-brand-100/90 bg-white/90 p-4 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="font-display text-3xl font-bold leading-none text-brand-600 md:text-4xl">{item.value}</p>
                  <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-stone-700">{item.label}</p>
                  <p className="mt-0.5 text-[10px] text-stone-400">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Redesigned Access Panel */}
        <div className="glass-panel mx-auto w-full max-w-xl p-7 shadow-[0_32px_90px_rgba(234,88,12,0.12)] md:p-9">
          <div className="mb-7 flex items-start justify-between gap-4 border-b border-brand-100/60 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/80 bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-brand-700">
                <Sparkles className="h-3 w-3 text-brand-500" />
                <span>Executive Access</span>
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-none text-stone-900">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                {mode === "login" ? "Sign in to access your operations workspace." : "Create a guest profile for bookings and orders."}
              </p>
            </div>
            
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-200/80 bg-gradient-to-br from-white to-brand-50 text-brand-600 shadow-sm">
              {mode === "login" ? <ShieldCheck className="h-6 w-6" /> : <Clock3 className="h-6 w-6" />}
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mb-6 flex rounded-2xl border border-brand-200/80 bg-brand-50/70 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer ${
                mode === "login" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer ${
                mode === "register" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Register
            </button>
          </div>

          {requestedPath ? (
            <div className="mb-5 rounded-2xl border border-brand-200 bg-brand-50/80 px-4 py-3 text-sm text-brand-700">
              Continue sign-in to return to <span className="font-semibold">{requestedPath}</span>.
            </div>
          ) : null}

          {error ? (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800 text-xs font-bold">!</span>
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" ? (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Guest Name</span>
                  <div className="relative">
                    <input
                      name="name"
                      aria-label="Guest name"
                      value={formValues.name}
                      onChange={handleChange}
                      className="input-shell pl-10"
                      placeholder="e.g. Aditi Sharma"
                      autoComplete="name"
                    />
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  </div>
                </label>
                
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Phone Number</span>
                  <div className="relative">
                    <input
                      name="phone"
                      aria-label="Phone number"
                      value={formValues.phone}
                      onChange={handleChange}
                      className="input-shell pl-10"
                      placeholder="+91 99999 12345"
                      autoComplete="tel"
                    />
                    <UtensilsCrossed className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  </div>
                </label>
              </>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Email Address</span>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  aria-label="Email"
                  value={formValues.email}
                  onChange={handleChange}
                  className="input-shell pl-10"
                  placeholder="name@smartdine.ai"
                  autoComplete="email"
                />
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-600">Password</span>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  aria-label="Password"
                  value={formValues.password}
                  onChange={handleChange}
                  className="input-shell pl-10"
                  placeholder="••••••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-brand-500/25"
            >
              {submitting ? "Authenticating..." : mode === "login" ? "Enter Workspace" : "Create Guest Account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Accounts Autofill */}
          <div className="mt-7 border-t border-brand-100/70 pt-5">
            <div className="mb-3.5 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-700">Quick Demo Accounts</p>
              <span className="text-xs text-stone-400">Click to autofill</span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => applyDemoAccount(account)}
                  className="group flex flex-col justify-between rounded-2xl border border-brand-100 bg-gradient-to-br from-white to-brand-50/50 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 group-hover:bg-brand-500 group-hover:text-white transition">
                      {account.role}
                    </span>
                    <ArrowRight className="h-3 w-3 text-stone-400 opacity-0 transition group-hover:opacity-100 group-hover:text-brand-600" />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-stone-700">{account.email}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-brand-100/60 pt-4 text-xs">
            <Link to="/" className="font-bold text-brand-600 hover:text-brand-700 transition">
              ← Return to public portal
            </Link>
            <p className="text-stone-400">Guest browsing works without sign-in.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
