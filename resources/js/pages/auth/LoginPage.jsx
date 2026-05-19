import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { useAuth } from "../../hooks/admin/AuthContext";
import { useI18n } from "../../hooks/admin/I18nContext";

function EyeIcon({ open = false }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7A3 3 0 0 0 13.3 13.4" />
      <path d="M9.9 5.1A11.4 11.4 0 0 1 12 5c6.5 0 10 7 10 7a17.3 17.3 0 0 1-4 4.8" />
      <path d="M6.7 6.8A17.7 17.7 0 0 0 2 12s3.5 7 10 7a10.8 10.8 0 0 0 4.2-.8" />
    </svg>
  );
}

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [platform, setPlatform] = useState({
    platform_name: "WORLD OF MADAGASCAR",
    logo: "/images/logo.png",
  });

  const redirectTo = location.state?.from || "/admin/dashboard";

  useEffect(() => {
    let active = true;

    async function loadPlatformSettings() {
      try {
        const settings = await fetchPlatformSettings();

        if (!active) return;

        setPlatform({
          platform_name: settings?.platform_name || "WORLD OF MADAGASCAR",
          logo: settings?.logo ? `/${String(settings.logo).replace(/^\/+/, "")}` : "/images/logo.png",
        });
      } catch {
        if (!active) return;

        setPlatform({
          platform_name: "WORLD OF MADAGASCAR",
          logo: "/images/logo.png",
        });
      }
    }

    loadPlatformSettings();

    return () => {
      active = false;
    };
  }, []);

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
      setError(err.response?.data?.message || t("public.auth.login.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-2"
      style={{
        backgroundImage: "url('/images/bg_login.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-md border border-[var(--line)] shadow-[var(--shadow)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-[linear-gradient(160deg,rgba(23,54,47,0.92),rgba(15,23,42,0.96))] p-8 text-white sm:p-12 lg:flex lg:flex-col lg:justify-start items-center">
          <div className="flex items-center justify-center py-4">
            <div className="flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded-sm border border-white/15 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.22)] xl:h-[240px] xl:w-[240px]">
              <img src={platform.logo} alt={platform.platform_name} className="h-full w-full object-contain" />
            </div>
          </div>
        </section>

        <section className="bg-white/92 p-8 backdrop-blur-sm sm:px-12 sm:py-6">
          <div className="mb-6 flex justify-center lg:hidden">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-sm border border-[var(--line)] bg-white p-3 shadow-sm">
              <img src={platform.logo} alt={platform.platform_name} className="h-full w-full object-contain" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-black text-[var(--ink)]">{t("public.auth.login.title")}</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">{t("public.auth.login.description")}</p>

          {error ? (
            <div className="mt-6 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--ink)]">{t("public.auth.login.fields.email")}</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-sm border border-[var(--line)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                placeholder={t("public.auth.login.fields.email_placeholder")}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--ink)]">{t("public.auth.login.fields.password")}</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-sm border border-[var(--line)] bg-white/80 px-4 py-3 pr-12 outline-none transition focus:border-[var(--accent)]"
                  placeholder={t("public.auth.login.fields.password_placeholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-[var(--muted)] transition hover:text-[var(--accent-dark)]"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-red-600 px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t("public.auth.login.submitting") : t("public.auth.login.submit")}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
