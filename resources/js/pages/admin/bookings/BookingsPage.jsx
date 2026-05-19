import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteBooking, fetchBookings } from "../../../api/bookings";
import { useI18n } from "../../../hooks/admin/I18nContext";
import { ActionButton, ActionLink } from "../../../components/admin/TableActions";
import { formatUsd } from "../../../utils/currency";

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-sm border border-dashed border-stone-300 bg-white/80 px-6 py-14 text-center shadow-sm">
      <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

function ConfirmModal({ open, title, message, cancelText, confirmText, loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button type="button" className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" onClick={onConfirm} disabled={loading}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ value, label }) {
  const styles = {
    booked: "bg-sky-100 text-sky-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-rose-100 text-rose-700",
  };

  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]", styles[value] || "bg-slate-100 text-slate-700")}>{label || value || "-"}</span>;
}

function sumCompletedPayments(payments = []) {
  return payments.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

function getLocale(lang) {
  const locales = {
    fr: "fr-FR",
    en: "en-US",
    es: "es-ES",
    de: "de-DE",
  };

  return locales[lang] || locales.fr;
}

function formatDate(value, lang) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(getLocale(lang));
}

function formatCurrency(value, lang) {
  return formatUsd(value, getLocale(lang));
}

export default function BookingsPage() {
  const { lang, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirmBooking, setConfirmBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (!location.state?.notice) return;
    setNotice(location.state.notice);
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  async function loadBookings() {
    setLoading(true);
    setError("");

    try {
      const items = await fetchBookings();
      setBookings(Array.isArray(items) ? items : []);
    } catch (requestError) {
      setBookings([]);
      setError(requestError.response?.data?.message || t("bookings.list.load_error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirmBooking) return;

    setActionLoading(true);
    setError("");

    try {
      await deleteBooking(confirmBooking.encrypted_id);
      setNotice(t("bookings.list.delete_success"));
      setConfirmBooking(null);
      await loadBookings();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("bookings.list.delete_error"));
    } finally {
      setActionLoading(false);
    }
  }

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = filter === "all" ? bookings : bookings.filter((booking) => booking.status === filter);

    if (!query) return items;

    return items.filter((booking) =>
      [booking.name, booking.email, booking.phone, booking.tour?.title, booking.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [bookings, filter, search]);

  const counts = useMemo(
    () => ({
      total: bookings.length,
      booked: bookings.filter((booking) => booking.status === "booked").length,
      completed: bookings.filter((booking) => booking.status === "completed").length,
      cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
    }),
    [bookings],
  );

  const statusLabels = useMemo(
    () => ({
      booked: t("bookings.status.booked"),
      completed: t("bookings.status.completed"),
      cancelled: t("bookings.status.cancelled"),
    }),
    [t],
  );

  return (
    <div className="space-y-2">
      <section className="overflow-hidden rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">{t("bookings.list.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("bookings.list.description")}</p>
          </div>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.list.stats.total")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.total}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.list.stats.booked")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.booked}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.list.stats.completed")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.completed}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.list.stats.cancelled")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.cancelled}</p>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition">
                <option value="all">{t("bookings.common.all")}</option>
                <option value="booked">{t("bookings.status.booked")}</option>
                <option value="completed">{t("bookings.status.completed")}</option>
                <option value="cancelled">{t("bookings.status.cancelled")}</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("bookings.list.filters.search_placeholder")} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-80" />
              <button type="button" onClick={loadBookings} className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800">
                {t("bookings.common.refresh")}
              </button>
            </div>
          </div>

          {notice ? <div className="mt-5 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</div> : null}
          {error ? <div className="mt-5 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

          <div className="mt-3">
            {loading ? (
              <EmptyState title={t("bookings.list.loading_title")} description={t("bookings.list.loading_description")} />
            ) : filteredBookings.length === 0 ? (
              <EmptyState title={t("bookings.list.empty_title")} description={t("bookings.list.empty_description")} />
            ) : (
              <div className="overflow-hidden rounded-sm border border-stone-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50 text-left">
                      <tr>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.list.table.client")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.list.table.tour")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.list.table.dates")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.list.table.payment")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.list.table.status")}</th>
                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.list.table.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {filteredBookings.map((booking) => {
                        const paidAmount = sumCompletedPayments(booking.payments);
                        const totalAmount = Number(booking.total_amount || 0);
                        const balanceAmount = Math.max(totalAmount - paidAmount, 0);

                        return (
                          <tr key={booking.encrypted_id || booking.id} className="align-top">
                            <td className="px-5 py-4">
                              <p className="font-extrabold text-slate-950">{booking.name}</p>
                              <p className="mt-1 text-sm text-slate-500">{booking.email}</p>
                              <p className="mt-1 text-sm text-slate-500">{booking.phone || "-"}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">{booking.tour?.title || "-"}</td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              <p>{formatDate(booking.start_date, lang)}</p>
                              <p className="mt-1">{formatDate(booking.end_date, lang)}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              <p>{t("bookings.list.table.total", { amount: formatCurrency(totalAmount, lang) })}</p>
                              <p className="mt-1">{t("bookings.list.table.paid", { amount: formatCurrency(paidAmount, lang) })}</p>
                              <p className="mt-1">{t("bookings.list.table.remaining", { amount: formatCurrency(balanceAmount, lang) })}</p>
                            </td>
                            <td className="px-5 py-4">
                              <StatusBadge value={booking.status} label={statusLabels[booking.status]} />
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap justify-end gap-2">
                                <ActionLink to={`/admin/bookings/${booking.encrypted_id}`} title={t("bookings.common.details")} icon="details" />
                                <ActionButton onClick={() => setConfirmBooking(booking)} title={t("bookings.common.delete")} icon="delete" tone="danger" />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ConfirmModal
        open={Boolean(confirmBooking)}
        title={t("bookings.list.delete_modal.title")}
        message={t("bookings.list.delete_modal.message", { name: confirmBooking?.name || "" })}
        cancelText={t("bookings.common.cancel")}
        confirmText={actionLoading ? t("bookings.list.delete_modal.loading") : t("bookings.list.delete_modal.confirm")}
        loading={actionLoading}
        onCancel={() => (actionLoading ? undefined : setConfirmBooking(null))}
        onConfirm={handleDelete}
      />
    </div>
  );
}
