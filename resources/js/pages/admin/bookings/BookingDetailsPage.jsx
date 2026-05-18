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

function StatusBadge({ value }) {
  const styles = {
    booked: "bg-sky-100 text-sky-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-rose-100 text-rose-700",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${styles[value] || "bg-slate-100 text-slate-700"}`}>{value || "booked"}</span>;
}

function PaymentStatusBadge({ value }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-rose-100 text-rose-700",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${styles[value] || "bg-slate-100 text-slate-700"}`}>{value || "pending"}</span>;
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

export default function BookingDetailsPage() {
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
        setError(requestError.response?.data?.message || "Impossible de charger les details du booking.");
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
      setNotice("Statut du booking mis a jour.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de mettre a jour le booking.");
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
      setNotice(result.message || (editingPayment ? "Paiement mis a jour." : "Paiement ajoute."));
      resetPaymentForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible d'enregistrer le paiement.");
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
    if (!window.confirm("Supprimer ce paiement ?")) return;

    setPaymentSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await deleteBookingPayment(bookingId, payment.encrypted_id);
      setBooking(result.booking);
      setNotice(result.message || "Paiement supprime.");
      if (editingPayment?.encrypted_id === payment.encrypted_id) {
        resetPaymentForm();
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de supprimer le paiement.");
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

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">Chargement du booking...</div>;
  }

  if (error && !booking) {
    return <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Details du booking</h2>
            <p className="mt-2 text-sm text-slate-500">Consultation de la reservation et gestion des paiements.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/bookings" className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">Retour a la liste</Link>
          </div>
        </div>
      </section>

      {notice ? <div className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</div> : null}
      {error ? <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="grid gap-4 px-4 py-5 sm:px-6 sm:py-6 md:grid-cols-2">
            <DetailCard label="Client" value={booking?.name} />
            <DetailCard label="Email" value={booking?.email} />
            <DetailCard label="Telephone" value={booking?.phone} />
            <DetailCard label="Tour" value={booking?.tour?.title} />
            <DetailCard label="Date de debut" value={booking?.start_date ? new Date(booking.start_date).toLocaleDateString("fr-FR") : "-"} />
            <DetailCard label="Date de fin" value={booking?.end_date ? new Date(booking.end_date).toLocaleDateString("fr-FR") : "-"} />
            <DetailCard label="Nombre de personnes" value={booking?.number_of_people ? String(booking.number_of_people) : "-"} />
            <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Statut</p><div className="mt-2"><StatusBadge value={booking?.status} /></div></div>
            <DetailCard label="Creation" value={booking?.created_at ? new Date(booking.created_at).toLocaleString("fr-FR") : "-"} />
            <DetailCard label="Derniere mise a jour" value={booking?.updated_at ? new Date(booking.updated_at).toLocaleString("fr-FR") : "-"} />
          </div>
          <div className="border-t border-stone-200 px-4 py-5 sm:px-6 sm:py-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Message</p><div className="mt-3 rounded-sm border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-7 text-slate-700">{booking?.message || "-"}</div></div>
        </section>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">Resume paiement</h3></div>
            <div className="grid gap-4 px-6 py-6">
              <DetailCard label="Montant total" value={totalAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} />
              <DetailCard label="Montant paye" value={paidAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} />
              <DetailCard label="Reste a payer" value={balanceAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} />
              <DetailCard label="Methodes disponibles" value={paymentMethods.length ? String(paymentMethods.length) : "Aucune methode active"} />
            </div>
          </section>

          <form onSubmit={handleStatusSubmit} className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">Mettre a jour le statut</h3></div>
            <div className="space-y-4 px-6 py-6">
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition">
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Enregistrement..." : "Mettre a jour"}</button>
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">Paiements enregistres</h3></div>
          <div className="px-6 py-6">
            {(booking?.payments || []).length === 0 ? (
              <p className="text-sm text-slate-500">Aucun paiement enregistre.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50 text-left">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Type</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Methode</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Montant</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Statut</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Echeance</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Reference</th>
                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {booking.payments.map((payment) => (
                      <tr key={payment.encrypted_id || payment.id}>
                        <td className="px-5 py-4 text-sm text-slate-700">{payment.payment_type || "installment"}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{payment.payment_method?.name || "-"}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{Number(payment.amount || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</td>
                        <td className="px-5 py-4"><PaymentStatusBadge value={payment.status} /></td>
                        <td className="px-5 py-4 text-sm text-slate-700">{payment.due_date ? new Date(payment.due_date).toLocaleDateString("fr-FR") : (payment.paid_at ? new Date(payment.paid_at).toLocaleDateString("fr-FR") : "-")}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{payment.reference || "-"}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button type="button" onClick={() => handleEditPayment(payment)} className="rounded-sm border border-stone-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-stone-100">Modifier</button>
                            <button type="button" onClick={() => handleDeletePayment(payment)} disabled={paymentSaving} className="rounded-sm border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">Supprimer</button>
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
            <h3 className="text-lg font-extrabold text-slate-950">{editingPayment ? "Modifier un paiement" : "Ajouter un paiement"}</h3>
            <p className="mt-2 text-sm text-slate-500">Les methodes disponibles proviennent des payment methods actifs.</p>
          </div>
          <div className="space-y-4 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-3">
              <DetailCard
                label="Paye apres validation"
                value={projectedPaidAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              />
              <DetailCard
                label="Reste apres validation"
                value={projectedRemaining.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              />
              <DetailCard
                label={projectedDifference > 0 ? "Depassement" : "Ecart"}
                value={
                  projectedDifference > 0
                    ? projectedOverpayment.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
                    : "0,00 €"
                }
              />
            </div>

            {projectedOverpayment > 0 ? (
              <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                Le paiement depasse le montant total de {projectedOverpayment.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}. Utilisez un paiement de type "adjustment" si cet ecart est volontaire.
              </div>
            ) : null}

            {projectedRemaining > 0 ? (
              <div className="rounded-sm border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
                Il restera {projectedRemaining.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} a payer apres cet enregistrement.
              </div>
            ) : null}

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">Methode de paiement</span>
              <select name="payment_method_id" value={paymentForm.payment_method_id} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" required>
                <option value="">Selectionner</option>
                {paymentMethods.map((method) => (
                  <option key={method.encrypted_id || method.id} value={method.id}>{method.name}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Montant</span>
                <input type="number" min="0" step="0.01" name="amount" value={paymentForm.amount} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" required />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Ordre</span>
                <input type="number" min="1" step="1" name="sort_order" value={paymentForm.sort_order} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" required />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Type</span>
                <select name="payment_type" value={paymentForm.payment_type} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition">
                  <option value="deposit">Deposit</option>
                  <option value="installment">Installment</option>
                  <option value="balance">Balance</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Statut</span>
                <select name="status" value={paymentForm.status} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Date d'echeance</span>
                <input type="date" name="due_date" value={paymentForm.due_date} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Date de paiement</span>
                <input type="date" name="paid_at" value={paymentForm.paid_at} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" />
              </label>
            </div>

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">Reference</span>
              <input type="text" name="reference" value={paymentForm.reference} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">Note</span>
              <textarea rows="4" name="note" value={paymentForm.note} onChange={handlePaymentFormChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition" />
            </label>

            {paymentMethods.length === 0 ? <p className="text-sm font-semibold text-amber-700">Aucune methode de paiement active n'est disponible.</p> : null}
            {isFullyPaid && !editingPayment ? (
              <p className="text-sm font-semibold text-green-700">Le booking est entierement regle. L'ajout d'un nouveau paiement est desactive.</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={paymentSaving || !canSubmitPayment} className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
                {paymentSaving ? "Enregistrement..." : editingPayment ? "Mettre a jour le paiement" : "Ajouter le paiement"}
              </button>
              {editingPayment ? (
                <button type="button" onClick={resetPaymentForm} disabled={paymentSaving} className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60">
                  Annuler
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
