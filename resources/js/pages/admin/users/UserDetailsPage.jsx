import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchUser } from "../../../api/users";
import { useI18n } from "../../../hooks/admin/I18nContext";

const DEFAULT_AVATAR = "/images/profil.png";

function buildAvatarUrl(path) {
  if (!path) return DEFAULT_AVATAR;
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}

function StatusBadge({ value, deletedAt, t }) {
  if (deletedAt) return <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-700">{t("users.status.trashed")}</span>;
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${value === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{t(`users.status.${value || "inactive"}`)}</span>;
}

function getLocale(lang) {
  const locales = { fr: "fr-FR", en: "en-US", es: "es-ES", de: "de-DE" };
  return locales[lang] || locales.fr;
}

function formatDateTime(value, lang) {
  if (!value) return "-";
  return new Date(value).toLocaleString(getLocale(lang));
}

export default function UserDetailsPage() {
  const { lang, t } = useI18n();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadUser() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchUser(userId);
        if (!active) return;
        setUser(data);
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || t("users.details.load_error"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadUser();
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">{t("users.details.loading")}</div>;
  if (error) return <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>;

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">{t("users.details.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("users.details.description")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/users" className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">{t("users.common.back")}</Link>
            <Link to={`/admin/users/${user?.encrypted_id}/edit`} className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700">{t("users.common.edit")}</Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
        <div className="grid gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
              <img src={buildAvatarUrl(user?.avatar)} alt={user?.pseudo || t("users.details.profile_alt")} className="h-72 w-72 object-center" />
            </div>
            <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4 text-center">
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${user?.role === "admin" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700"}`}>{t(`users.role.${user?.role || "user"}`)}</span>
                <StatusBadge value={user?.status} deletedAt={user?.deleted_at} t={t} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard label={t("users.details.fields.pseudo")} value={user?.pseudo} />
            <DetailCard label={t("users.details.fields.email")} value={user?.email} />
            <DetailCard label={t("users.details.fields.contact")} value={user?.contact} />
            <DetailCard label={t("users.details.fields.address")} value={user?.address} />
            <DetailCard label={t("users.details.fields.role")} value={t(`users.role.${user?.role || "user"}`)} />
            <DetailCard label={t("users.details.fields.status")} value={user?.deleted_at ? t("users.status.trashed") : t(`users.status.${user?.status || "inactive"}`)} />
            <DetailCard label={t("users.details.fields.created_at")} value={formatDateTime(user?.created_at, lang)} />
            <DetailCard label={t("users.details.fields.updated_at")} value={formatDateTime(user?.updated_at, lang)} />
          </div>
        </div>
      </section>
    </div>
  );
}
