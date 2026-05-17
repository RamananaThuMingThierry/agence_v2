import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  deleteTestimonial,
  fetchTestimonials,
  forceDeleteTestimonial,
  restoreTestimonial,
  updateTestimonial,
} from "../../../api/testimonials";

function buildImageUrl(path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
}

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
            {loading ? "Traitement..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusModal({ open, testimonial, loading, onCancel, onConfirm }) {
  const [status, setStatus] = useState("publish");

  useEffect(() => {
    if (!open || !testimonial) return;
    setStatus(testimonial.status || "publish");
  }, [open, testimonial]);

  if (!open || !testimonial) return null;

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
          <h2 className="text-2xl font-extrabold text-slate-950">Modifier le statut</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Changez uniquement le statut de publication pour "{testimonial.name}".
          </p>
        </div>

        <label className="block space-y-2">
          <span className="block text-sm font-bold text-slate-800">Statut</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={loading}
            className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="publish">Publie</option>
            <option value="archived">Archive</option>
          </select>
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
            onClick={() => onConfirm(status)}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Mettre a jour"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ deletedAt, status }) {
  if (deletedAt) {
    return <span className="inline-flex rounded-sm bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">Corbeille</span>;
  }

  if (status === "archived") {
    return <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Archive</span>;
  }

  return <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-green-700">Publie</span>;
}

export default function TestimonialsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("publish");
  const [confirmState, setConfirmState] = useState(null);
  const [statusModalTestimonial, setStatusModalTestimonial] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, [filter]);

  useEffect(() => {
    if (!location.state?.notice) return;

    setNotice(location.state.notice);
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  async function loadTestimonials() {
    setLoading(true);
    setError("");

    try {
      const items = await fetchTestimonials({
        with_trashed: true,
        only_trashed: false,
      });

      setTestimonials(items);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de charger les testimonials.");
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }

  function openConfirm(action, testimonial) {
    const config = {
      delete: {
        title: "Supprimer le testimonial",
        message: `Voulez-vous envoyer "${testimonial.name}" dans la corbeille ?`,
        confirmText: "Oui, supprimer",
      },
      restore: {
        title: "Restaurer le testimonial",
        message: `Voulez-vous restaurer "${testimonial.name}" ?`,
        confirmText: "Oui, restaurer",
      },
      force: {
        title: "Suppression definitive",
        message: `Voulez-vous supprimer definitivement "${testimonial.name}" et sa photo ?`,
        confirmText: "Oui, supprimer",
      },
    };

    setConfirmState({
      action,
      testimonial,
      ...config[action],
    });
  }

  async function handleConfirmAction() {
    if (!confirmState) return;

    setActionLoading(true);

    try {
      if (confirmState.action === "delete") {
        await deleteTestimonial(confirmState.testimonial.encrypted_id);
        setNotice("Testimonial deplace dans la corbeille.");
      } else if (confirmState.action === "restore") {
        await restoreTestimonial(confirmState.testimonial.encrypted_id);
        setNotice("Testimonial restaure.");
      } else if (confirmState.action === "force") {
        await forceDeleteTestimonial(confirmState.testimonial.encrypted_id);
        setNotice("Testimonial supprime definitivement.");
      }

      setConfirmState(null);
      await loadTestimonials();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Operation impossible sur le testimonial.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusUpdate(nextStatus) {
    if (!statusModalTestimonial) return;

    setActionLoading(true);
    setError("");

    try {
      await updateTestimonial(statusModalTestimonial.encrypted_id, {
        name: statusModalTestimonial.name,
        message: statusModalTestimonial.message,
        rating: statusModalTestimonial.rating ?? 5,
        status: nextStatus,
      });

      setStatusModalTestimonial(null);
      setNotice("Statut du testimonial mis a jour.");
      await loadTestimonials();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de modifier le statut du testimonial.");
    } finally {
      setActionLoading(false);
    }
  }

  const filteredTestimonials = useMemo(() => {
    const query = search.trim().toLowerCase();
    const baseItems = testimonials.filter((testimonial) => {
      if (filter === "publish") {
        return !testimonial.deleted_at && testimonial.status === "publish";
      }

      if (filter === "archived") {
        return !testimonial.deleted_at && testimonial.status === "archived";
      }

      if (filter === "all") {
        return !testimonial.deleted_at;
      }

      if (filter === "trashed") {
        return Boolean(testimonial.deleted_at);
      }

      return true;
    });

    if (!query) {
      return baseItems;
    }

    return baseItems.filter((testimonial) =>
      [testimonial.name, testimonial.message, testimonial.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [filter, search, testimonials]);

  const counts = useMemo(
    () => ({
      publish: testimonials.filter((testimonial) => !testimonial.deleted_at && testimonial.status === "publish").length,
      archived: testimonials.filter((testimonial) => !testimonial.deleted_at && testimonial.status === "archived").length,
      trashed: testimonials.filter((testimonial) => Boolean(testimonial.deleted_at)).length,
      total: testimonials.length,
    }),
    [testimonials],
  );

  return (
    <div className="space-y-2">
      <section className="overflow-hidden rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Gestion des testimonials</h2>
            <p className="mt-2 text-sm text-slate-500">
              Pilotez les temoignages affiches sur la page d'accueil avec publication, archivage et corbeille.
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Publies</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.publish}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Archives</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.archived}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Corbeille</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.trashed}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.total}</p>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={filter === "trashed" ? "all" : filter}
                onChange={(event) => setFilter(event.target.value)}
                className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition"
              >
                <option value="all">Tous</option>
                <option value="publish">Publies</option>
                <option value="archived">Archives</option>
              </select>

              <button
                type="button"
                onClick={() => setFilter("trashed")}
                className={cn(
                  "rounded-sm px-4 py-3 text-sm font-bold transition",
                  filter === "trashed"
                    ? "bg-red-600 text-white"
                    : "border border-stone-300 bg-white text-slate-700 hover:border-red-300 hover:text-red-800",
                )}
              >
                Corbeille
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un testimonial..."
                className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-80"
              />
              <button
                type="button"
                onClick={loadTestimonials}
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
              <EmptyState title="Chargement..." description="Les testimonials sont en cours de recuperation depuis l'API." />
            ) : filteredTestimonials.length === 0 ? (
              <EmptyState title="Aucun testimonial trouve" description="Modifiez les filtres ou rafraichissez la liste." />
            ) : (
              <div className="overflow-hidden rounded-sm border border-stone-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50 text-left">
                      <tr>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Client</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Message</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Note</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Statut</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Creation</th>
                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {filteredTestimonials.map((testimonial) => (
                        <tr key={testimonial.encrypted_id || testimonial.id} className="align-top">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-red-50 font-black text-red-700">
                                {testimonial.image ? (
                                  <img src={buildImageUrl(testimonial.image)} alt={testimonial.name} className="h-full w-full object-cover" />
                                ) : (
                                  testimonial.name?.charAt(0)?.toUpperCase() || "T"
                                )}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-950">{testimonial.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            <p className="max-w-xl line-clamp-3">{testimonial.message}</p>
                          </td>
                          <td className="px-5 py-4 text-base tracking-[0.22em] text-amber-500">{"★".repeat(Number(testimonial.rating || 5))}</td>
                          <td className="px-5 py-4">
                            <StatusBadge deletedAt={testimonial.deleted_at} status={testimonial.status} />
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">
                            {testimonial.created_at ? new Date(testimonial.created_at).toLocaleDateString("fr-FR") : "-"}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap justify-end gap-2">
                              {!testimonial.deleted_at ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setStatusModalTestimonial(testimonial)}
                                    className="rounded-sm border px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-black hover:text-white"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openConfirm("delete", testimonial)}
                                    className="rounded-sm border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-red-600 hover:text-white"
                                  >
                                    Supprimer
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openConfirm("restore", testimonial)}
                                    className="rounded-sm border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
                                  >
                                    Restaurer
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openConfirm("force", testimonial)}
                                    className="rounded-sm border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                                  >
                                    Definitif
                                  </button>
                                </>
                              )}
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
        onConfirm={handleConfirmAction}
      />
      <StatusModal
        open={Boolean(statusModalTestimonial)}
        testimonial={statusModalTestimonial}
        loading={actionLoading}
        onCancel={() => (actionLoading ? undefined : setStatusModalTestimonial(null))}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
}


