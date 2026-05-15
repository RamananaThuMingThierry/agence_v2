import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/admin/AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/admin/dashboard";

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="bg-[linear-gradient(160deg,#17362f,#0f172a)] p-8 text-white sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">Admin Access</p>
          <h1 className="mt-5 text-4xl font-black uppercase leading-none sm:text-5xl">World of Madagascar</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/75">
            Connectez-vous pour gerer le dashboard admin, les slides, les testimonials, les tours, la galerie et les futurs modules du site.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <p className="text-sm font-semibold">Modules</p>
              <p className="mt-2 text-sm text-white/70">Slides, tours, testimonials, galleries.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <p className="text-sm font-semibold">Role requis</p>
              <p className="mt-2 text-sm text-white/70">Compte admin actif uniquement.</p>
            </div>
          </div>
        </section>

        <section className="p-8 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent-dark)]">Login</p>
          <h2 className="mt-4 text-3xl font-black text-[var(--ink)]">Connexion administrateur</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">Utilisez votre email et votre mot de passe administrateur.</p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--ink)]">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--ink)]">Mot de passe</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[var(--accent)] px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
