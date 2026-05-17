import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBooking, updateBooking } from "../../../api/bookings";

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

function sumCompletedPayments(payments = []) {
  return payments.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState("booked");

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

  const paidAmount = useMemo(() => sumCompletedPayments(booking?.payments), [booking]);
  const totalAmount = Number(booking?.total_amount || 0);
  const balanceAmount = Math.max(totalAmount - paidAmount, 0);

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
            <p className="mt-2 text-sm text-slate-500">Consultation de la reservation et de ses paiements.</p>
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

      <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">Paiements</h3></div>
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
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Paiement</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {booking.payments.map((payment) => (
                    <tr key={payment.encrypted_id || payment.id}>
                      <td className="px-5 py-4 text-sm text-slate-700">{payment.payment_type || "installment"}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{payment.payment_method?.name || "-"}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{Number(payment.amount || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{payment.status || "pending"}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{payment.paid_at ? new Date(payment.paid_at).toLocaleString("fr-FR") : "-"}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{payment.reference || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
