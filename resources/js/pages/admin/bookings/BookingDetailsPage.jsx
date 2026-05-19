import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createBookingPayment,
  deleteBookingPayment,
  fetchBooking,
  updateBooking,
  updateBookingPayment,
} from "../../../api/bookings";
import { fetchPaymentMethods } from "../../../api/paymentMethods";
import { useI18n } from "../../../hooks/admin/I18nContext";
import { ActionButton } from "../../../components/admin/TableActions";
import { formatUsd } from "../../../utils/currency";

const EMPTY_PAYMENT_FORM = {
  payment_method_id: "",
  amount: "",
  payment_type: "installment",
  status: "pending",
  due_date: "",
  paid_at: "",
  reference: "",
  note: "",
  sort_order: "1",
};

function DetailCard({ label, value }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}

function StatusBadge({ value, label }) {
  const styles = {
    booked: "bg-sky-100 text-sky-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-rose-100 text-rose-700",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${styles[value] || "bg-slate-100 text-slate-700"}`}>{label || value || "-"}</span>;
}

function PaymentStatusBadge({ value, label }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-rose-100 text-rose-700",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${styles[value] || "bg-slate-100 text-slate-700"}`}>{label || value || "-"}</span>;
}

function sumCompletedPayments(payments = []) {
  return payments.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function sumProjectedPayments(payments = [], editingPayment, paymentForm) {
  const draftAmount = Number(paymentForm.amount || 0);
  const draftStatus = paymentForm.status || "pending";

  return payments.reduce((sum, payment) => {
    if (editingPayment?.encrypted_id && payment.encrypted_id === editingPayment.encrypted_id) {
      return sum + (draftStatus === "completed" ? draftAmount : 0);
    }

    return sum + (payment.status === "completed" ? Number(payment.amount || 0) : 0);
  }, 0);
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

function formatDateTime(value, lang) {
  if (!value) return "-";
  return new Date(value).toLocaleString(getLocale(lang));
}

function formatCurrency(value, lang) {
  return formatUsd(value, getLocale(lang));
}

export default function BookingDetailsPage() {
  const { lang, t } = useI18n();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState("booked");
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT_FORM);
  const [editingPayment, setEditingPayment] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadBooking() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchBooking(bookingId);
        if (!active) return;
        setBooking(data);
        setStatus(data?.status || "booked");
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || t("bookings.details.load_error"));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBooking();

    return () => {
      active = false;
    };
  }, [bookingId]);

  useEffect(() => {
    let active = true;

    async function loadPaymentMethods() {
      try {
        const items = await fetchPaymentMethods();
        if (!active) return;
        setPaymentMethods(items.filter((item) => Boolean(item?.is_active)));
      } catch {
        if (active) {
          setPaymentMethods([]);
        }
      }
    }

    loadPaymentMethods();

    return () => {
      active = false;
    };
  }, []);

  function resetPaymentForm() {
    setEditingPayment(null);
    setPaymentForm(EMPTY_PAYMENT_FORM);
  }

  function handlePaymentFormChange(event) {
    const { name, value } = event.target;
    setPaymentForm((current) => ({ ...current, [name]: value }));
  }

  async function handleStatusSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updated = await updateBooking(bookingId, { status });
      setBooking(updated);
      setStatus(updated?.status || status);
      setNotice(t("bookings.details.status_updated"));
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("bookings.details.status_update_error"));
    } finally {
      setSaving(false);
    }
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault();
    setPaymentSaving(true);
    setError("");
    setNotice("");

    const payload = {
      payment_method_id: Number(paymentForm.payment_method_id),
      amount: Number(paymentForm.amount || 0),
      payment_type: paymentForm.payment_type,
      status: paymentForm.status,
      due_date: paymentForm.due_date || null,
      paid_at: paymentForm.paid_at || null,
      reference: paymentForm.reference || null,
      note: paymentForm.note || null,
      sort_order: Number(paymentForm.sort_order || 1),
    };

    try {
      const result = editingPayment
        ? await updateBookingPayment(bookingId, editingPayment.encrypted_id, payload)
        : await createBookingPayment(bookingId, payload);

      setBooking(result.booking);
      setNotice(result.message || (editingPayment ? t("bookings.details.payment_updated") : t("bookings.details.payment_added")));
      resetPaymentForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("bookings.details.payment_save_error"));
    } finally {
      setPaymentSaving(false);
    }
  }

  function handleEditPayment(payment) {
    setEditingPayment(payment);
    setPaymentForm({
      payment_method_id: String(payment?.payment_method?.id || ""),
      amount: String(payment?.amount || ""),
      payment_type: payment?.payment_type || "installment",
      status: payment?.status || "pending",
      due_date: toDateInputValue(payment?.due_date),
      paid_at: toDateInputValue(payment?.paid_at),
      reference: payment?.reference || "",
      note: payment?.note || "",
      sort_order: String(payment?.sort_order || 1),
    });
  }

  async function handleDeletePayment(payment) {
    if (!payment?.encrypted_id) return;
    if (!window.confirm(t("bookings.details.payment_delete_confirm"))) return;

    setPaymentSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await deleteBookingPayment(bookingId, payment.encrypted_id);
      setBooking(result.booking);
      setNotice(result.message || t("bookings.details.payment_deleted"));

      if (editingPayment?.encrypted_id === payment.encrypted_id) {
        resetPaymentForm();
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("bookings.details.payment_delete_error"));
    } finally {
      setPaymentSaving(false);
    }
  }

  const paidAmount = useMemo(() => sumCompletedPayments(booking?.payments), [booking]);
  const totalAmount = Number(booking?.total_amount || 0);
  const balanceAmount = Math.max(totalAmount - paidAmount, 0);
  const projectedPaidAmount = useMemo(
    () => sumProjectedPayments(booking?.payments || [], editingPayment, paymentForm),
    [booking?.payments, editingPayment, paymentForm],
  );
  const projectedDifference = Number((projectedPaidAmount - totalAmount).toFixed(2));
  const projectedRemaining = Math.max(totalAmount - projectedPaidAmount, 0);
  const projectedOverpayment = Math.max(projectedPaidAmount - totalAmount, 0);
  const isFullyPaid = balanceAmount <= 0;
  const canSubmitPayment = paymentMethods.length > 0 && (!isFullyPaid || Boolean(editingPayment));

  const bookingStatusLabels = useMemo(
    () => ({
      booked: t("bookings.status.booked"),
      completed: t("bookings.status.completed"),
      cancelled: t("bookings.status.cancelled"),
    }),
    [t],
  );

  const paymentStatusLabels = useMemo(
    () => ({
      pending: t("bookings.payment_status.pending"),
      completed: t("bookings.payment_status.completed"),
      failed: t("bookings.payment_status.failed"),
    }),
    [t],
  );

  const paymentTypeLabels = useMemo(
    () => ({
      deposit: t("bookings.payment_type.deposit"),
      installment: t("bookings.payment_type.installment"),
      balance: t("bookings.payment_type.balance"),
      adjustment: t("bookings.payment_type.adjustment"),
    }),
    [t],
  );

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">{t("bookings.details.loading")}</div>;
  }

  if (error && !booking) {
    return <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">{t("bookings.details.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("bookings.details.description")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/bookings" className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">
              {t("bookings.details.back")}
            </Link>
          </div>
        </div>
      </section>

      {notice ? <div className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</div> : null}
      {error ? <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="grid gap-4 px-4 py-5 sm:px-6 sm:py-6 md:grid-cols-2">
            <DetailCard label={t("bookings.details.client")} value={booking?.name} />
            <DetailCard label={t("bookings.details.email")} value={booking?.email} />
            <DetailCard label={t("bookings.details.phone")} value={booking?.phone} />
            <DetailCard label={t("bookings.details.tour")} value={booking?.tour?.title} />
            <DetailCard label={t("bookings.details.start_date")} value={formatDate(booking?.start_date, lang)} />
            <DetailCard label={t("bookings.details.end_date")} value={formatDate(booking?.end_date, lang)} />
            <DetailCard label={t("bookings.details.number_of_people")} value={booking?.number_of_people ? String(booking.number_of_people) : "-"} />
            <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.details.status")}</p>
              <div className="mt-2">
                <StatusBadge value={booking?.status} label={bookingStatusLabels[booking?.status]} />
              </div>
            </div>
            <DetailCard label={t("bookings.details.created_at")} value={formatDateTime(booking?.created_at, lang)} />
            <DetailCard label={t("bookings.details.updated_at")} value={formatDateTime(booking?.updated_at, lang)} />
          </div>

          <div className="border-t border-stone-200 px-4 py-5 sm:px-6 sm:py-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.details.message")}</p>
            <div className="mt-3 rounded-sm border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-7 text-slate-700">{booking?.message || "-"}</div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-6 py-5">
              <h3 className="text-lg font-extrabold text-slate-950">{t("bookings.details.payment_summary")}</h3>
            </div>
            <div className="grid gap-4 px-6 py-6">
              <DetailCard label={t("bookings.details.total_amount")} value={formatCurrency(totalAmount, lang)} />
              <DetailCard label={t("bookings.details.paid_amount")} value={formatCurrency(paidAmount, lang)} />
              <DetailCard label={t("bookings.details.remaining_amount")} value={formatCurrency(balanceAmount, lang)} />
              <DetailCard label={t("bookings.details.available_methods")} value={paymentMethods.length ? String(paymentMethods.length) : t("bookings.details.no_active_method")} />
            </div>
          </section>

          <form onSubmit={handleStatusSubmit} className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-6 py-5">
              <h3 className="text-lg font-extrabold text-slate-950">{t("bookings.details.update_status")}</h3>
            </div>
            <div className="space-y-4 px-6 py-6">
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition">
                <option value="booked">{t("bookings.status.booked")}</option>
                <option value="completed">{t("bookings.status.completed")}</option>
                <option value="cancelled">{t("bookings.status.cancelled")}</option>
              </select>
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? t("bookings.details.saving") : t("bookings.details.save_status")}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-6 py-5">
            <h3 className="text-lg font-extrabold text-slate-950">{t("bookings.details.payments_registered")}</h3>
          </div>
          <div className="px-6 py-6">
            {(booking?.payments || []).length === 0 ? (
              <p className="text-sm text-slate-500">{t("bookings.details.no_payments")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50 text-left">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.details.table.type")}</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.details.table.method")}</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.details.table.amount")}</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.details.table.status")}</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.details.table.due_date")}</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.details.table.reference")}</th>
                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("bookings.details.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {booking.payments.map((payment) => (
                      <tr key={payment.encrypted_id || payment.id}>
                        <td className="px-5 py-4 text-sm text-slate-700">{paymentTypeLabels[payment.payment_type] || payment.payment_type || "-"}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{payment.payment_method?.name || "-"}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{formatCurrency(payment.amount, lang)}</td>
                        <td className="px-5 py-4">
                          <PaymentStatusBadge value={payment.status} label={paymentStatusLabels[payment.status]} />
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">{payment.due_date ? formatDate(payment.due_date, lang) : payment.paid_at ? formatDate(payment.paid_at, lang) : "-"}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{payment.reference || "-"}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <ActionButton onClick={() => handleEditPayment(payment)} title={t("bookings.common.edit")} icon="edit" />
                            <ActionButton onClick={() => handleDeletePayment(payment)} title={t("bookings.common.delete")} icon="delete" tone="danger" disabled={paymentSaving} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <form onSubmit={handlePaymentSubmit} className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-6 py-5">
            <h3 className="text-lg font-extrabold text-slate-950">{editingPayment ? t("bookings.details.payment_form_title_edit") : t("bookings.details.payment_form_title_add")}</h3>
            <p className="mt-2 text-sm text-slate-500">{t("bookings.details.payment_form_description")}</p>
          </div>
          <div className="space-y-4 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-3">
              <DetailCard label={t("bookings.details.projected_paid")} value={formatCurrency(projectedPaidAmount, lang)} />
              <DetailCard label={t("bookings.details.projected_remaining")} value={formatCurrency(projectedRemaining, lang)} />
              <DetailCard label={projectedDifference > 0 ? t("bookings.details.overpayment") : t("bookings.details.difference")} value={projectedDifference > 0 ? formatCurrency(projectedOverpayment, lang) : formatCurrency(0, lang)} />
            </div>

            {projectedOverpayment > 0 ? (
              <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                {t("bookings.details.overpayment_notice", { amount: formatCurrency(projectedOverpayment, lang) })}
              </div>
            ) : null}

            {projectedRemaining > 0 ? (
              <div className="rounded-sm border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
                {t("bookings.details.remaining_notice", { amount: formatCurrency(projectedRemaining, lang) })}
              </div>
            ) : null}

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">{t("bookings.details.payment_method")}</span>
              <select name="payment_method_id" value={paymentForm.payment_method_id} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" required>
                <option value="">{t("bookings.common.select")}</option>
                {paymentMethods.map((method) => (
                  <option key={method.encrypted_id || method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("bookings.details.amount")}</span>
                <input type="number" min="0" step="0.01" name="amount" value={paymentForm.amount} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" required />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("bookings.details.sort_order")}</span>
                <input type="number" min="1" step="1" name="sort_order" value={paymentForm.sort_order} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" required />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("bookings.details.type")}</span>
                <select name="payment_type" value={paymentForm.payment_type} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition">
                  <option value="deposit">{t("bookings.payment_type.deposit")}</option>
                  <option value="installment">{t("bookings.payment_type.installment")}</option>
                  <option value="balance">{t("bookings.payment_type.balance")}</option>
                  <option value="adjustment">{t("bookings.payment_type.adjustment")}</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("bookings.details.status")}</span>
                <select name="status" value={paymentForm.status} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition">
                  <option value="pending">{t("bookings.payment_status.pending")}</option>
                  <option value="completed">{t("bookings.payment_status.completed")}</option>
                  <option value="failed">{t("bookings.payment_status.failed")}</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("bookings.details.due_date")}</span>
                <input type="date" name="due_date" value={paymentForm.due_date} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("bookings.details.paid_at")}</span>
                <input type="date" name="paid_at" value={paymentForm.paid_at} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" />
              </label>
            </div>

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">{t("bookings.details.reference")}</span>
              <input type="text" name="reference" value={paymentForm.reference} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">{t("bookings.details.note")}</span>
              <textarea rows="4" name="note" value={paymentForm.note} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" />
            </label>

            {paymentMethods.length === 0 ? <p className="text-sm font-semibold text-amber-700">{t("bookings.details.no_active_payment_methods")}</p> : null}
            {isFullyPaid && !editingPayment ? <p className="text-sm font-semibold text-green-700">{t("bookings.details.fully_paid_notice")}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={paymentSaving || !canSubmitPayment} className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
                {paymentSaving ? t("bookings.details.saving") : editingPayment ? t("bookings.details.save_payment_edit") : t("bookings.details.save_payment_add")}
              </button>
              {editingPayment ? (
                <button type="button" onClick={resetPaymentForm} disabled={paymentSaving} className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60">
                  {t("bookings.common.cancel")}
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
