import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteContactForm, fetchContactForms } from "../../../api/contactForms";

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

function ConfirmModal({ open, title, message, confirmText, loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Suppression..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ value }) {
  const tones = {
    general: "bg-slate-100 text-slate-700",
    circuit: "bg-sky-100 text-sky-700",
    claim: "bg-rose-100 text-rose-700",
    quotation: "bg-amber-100 text-amber-700",
  };

  const labels = {
    general: "General",
    circuit: "Circuit",
    claim: "Claim",
    quotation: "Quotation",
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]", tones[value] || tones.general)}>
      {labels[value] || value || "General"}
    </span>
  );
}

export default function ContactFormsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [contactForms, setContactForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirmState, setConfirmState] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadContactForms();
  }, []);

  useEffect(() => {
    if (!location.state?.notice) return;

    setNotice(location.state.notice);
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  async function loadContactForms() {
    setLoading(true);
    setError("");

    try {
      const items = await fetchContactForms();
      setContactForms(items);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de charger les formulaires de contact.");
      setContactForms([]);
    } finally {
      setLoading(false);
    }
  }

  function openConfirm(contactForm) {
    setConfirmState({
      contactForm,
      title: "Supprimer le formulaire",
      message: `Voulez-vous supprimer definitivement la demande de "${contactForm.name}" ?`,
      confirmText: "Oui, supprimer",
    });
  }

  async function handleDelete() {
    if (!confirmState?.contactForm) return;

    setActionLoading(true);
    setError("");

    try {
      await deleteContactForm(confirmState.contactForm.encrypted_id);
      setConfirmState(null);
      setNotice("Formulaire de contact supprime.");
      await loadContactForms();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de supprimer le formulaire de contact.");
    } finally {
      setActionLoading(false);
    }
  }

  const filteredContactForms = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = filter === "all" ? contactForms : contactForms.filter((contactForm) => contactForm.type === filter);

    if (!query) return items;

    return items.filter((contactForm) =>
      [contactForm.name, contactForm.email, contactForm.subject, contactForm.message, contactForm.type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [contactForms, filter, search]);

  const counts = useMemo(
    () => ({
      total: contactForms.length,
      general: contactForms.filter((contactForm) => contactForm.type === "general").length,
      circuit: contactForms.filter((contactForm) => contactForm.type === "circuit").length,
      quotation: contactForms.filter((contactForm) => contactForm.type === "quotation").length,
    }),
    [contactForms],
  );

  return (
    <div className="space-y-2">
      <section className="overflow-hidden rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Gestion des formulaires de contact</h2>
            <p className="mt-2 text-sm text-slate-500">
              Consultez les demandes recues depuis le site et supprimez celles qui ne sont plus utiles.
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.total}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">General</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.general}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Circuit</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.circuit}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Quotation</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.quotation}</p>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition"
              >
                <option value="all">Tous</option>
                <option value="general">General</option>
                <option value="circuit">Circuit</option>
                <option value="claim">Claim</option>
                <option value="quotation">Quotation</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une demande..."
                className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-80"
              />
              <button
                type="button"
                onClick={loadContactForms}
                className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800"
              >
                Rafraichir
              </button>
            </div>
          </div>

          {notice ? (
            <div className="mt-5 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              {notice}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-3">
            {loading ? (
              <EmptyState title="Chargement..." description="Les formulaires de contact sont en cours de recuperation depuis l'API." />
            ) : filteredContactForms.length === 0 ? (
              <EmptyState title="Aucune demande trouvee" description="Ajustez les filtres ou verifiez si de nouveaux formulaires ont ete recus." />
            ) : (
              <div className="overflow-hidden rounded-sm border border-stone-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50 text-left">
                      <tr>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Contact</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sujet</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Type</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Message</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Creation</th>
                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {filteredContactForms.map((contactForm) => (
                        <tr key={contactForm.encrypted_id || contactForm.id} className="align-top">
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-extrabold text-slate-950">{contactForm.name}</p>
                              <p className="mt-1 text-sm text-slate-500">{contactForm.email}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-700">{contactForm.subject || "-"}</td>
                          <td className="px-5 py-4">
                            <TypeBadge value={contactForm.type} />
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            <p className="max-w-xl line-clamp-3">{contactForm.message}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">
                            {contactForm.created_at ? new Date(contactForm.created_at).toLocaleDateString("fr-FR") : "-"}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap justify-end gap-2">
                              <Link
                                to={`/admin/contact-forms/${contactForm.encrypted_id}`}
                                className="rounded-sm border px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-black hover:text-white"
                              >
                                Details
                              </Link>
                              <button
                                type="button"
                                onClick={() => openConfirm(contactForm)}
                                className="rounded-sm border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-red-600 hover:text-white"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ConfirmModal
        open={Boolean(confirmState)}
        title={confirmState?.title || ""}
        message={confirmState?.message || ""}
        confirmText={confirmState?.confirmText || "Confirmer"}
        loading={actionLoading}
        onCancel={() => (actionLoading ? undefined : setConfirmState(null))}
        onConfirm={handleDelete}
      />
    </div>
  );
}
