import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteContactForm, fetchContactForm } from "../../../api/contactForms";

function DetailCard({ label, value }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmText, loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" onClick={onCancel} disabled={loading}>Annuler</button>
          <button type="button" className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" onClick={onConfirm} disabled={loading}>{loading ? "Suppression..." : confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export default function ContactFormDetailsPage() {
  const { contactFormId } = useParams();
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadContactForm() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchContactForm(contactFormId);
        if (!active) return;
        setContactForm(data);
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || "Impossible de charger les details du formulaire de contact.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadContactForm();
    return () => {
      active = false;
    };
  }, [contactFormId]);

  async function handleDelete() {
    if (!contactForm?.encrypted_id) return;

    setActionLoading(true);

    try {
      await deleteContactForm(contactForm.encrypted_id);
      navigate("/admin/contact-forms", { replace: true, state: { notice: "Formulaire de contact supprime." } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de supprimer le formulaire de contact.");
      setActionLoading(false);
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">Chargement du formulaire...</div>;
  }

  if (error) {
    return <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Details du formulaire de contact</h2>
            <p className="mt-2 text-sm text-slate-500">Consultation du message recu depuis le site.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/contact-forms" className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">Retour a la liste</Link>
            <button type="button" onClick={() => setConfirmOpen(true)} className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700">Supprimer</button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
        <div className="grid gap-4 px-4 py-5 sm:px-6 sm:py-6 md:grid-cols-2">
          <DetailCard label="Nom" value={contactForm?.name} />
          <DetailCard label="Email / Contact" value={contactForm?.email} />
          <DetailCard label="Sujet" value={contactForm?.subject} />
          <DetailCard label="Creation" value={contactForm?.created_at ? new Date(contactForm.created_at).toLocaleString("fr-FR") : "-"} />
          <DetailCard label="Derniere mise a jour" value={contactForm?.updated_at ? new Date(contactForm.updated_at).toLocaleString("fr-FR") : "-"} />
        </div>

        <div className="border-t border-stone-200 px-4 py-5 sm:px-6 sm:py-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Message</p>
          <div className="mt-3 rounded-sm border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-7 text-slate-700">{contactForm?.message || "-"}</div>
        </div>
      </section>

      <ConfirmModal open={confirmOpen} title="Supprimer le formulaire" message={`Voulez-vous supprimer definitivement la demande de "${contactForm?.name}" ?`} confirmText="Oui, supprimer" loading={actionLoading} onCancel={() => (actionLoading ? undefined : setConfirmOpen(false))} onConfirm={handleDelete} />
    </div>
  );
}
