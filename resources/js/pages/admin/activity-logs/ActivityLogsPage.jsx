import React, { useEffect, useMemo, useState } from "react";
import { deleteActivityLog, fetchActivityLogs } from "../../../api/activityLogs";

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "chevrons-left":
      return (
        <svg {...common}>
          <path d="m11 17-5-5 5-5" />
          <path d="m18 17-5-5 5-5" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "chevrons-right":
      return (
        <svg {...common}>
          <path d="m6 17 5-5-5-5" />
          <path d="m13 17 5-5-5-5" />
        </svg>
      );
    default:
      return null;
  }
}

function colorClass(color) {
  switch (color) {
    case "success":
      return "bg-green-100 text-green-700";
    case "warning":
      return "bg-amber-100 text-amber-700";
    case "danger":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
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

function DetailsModal({ open, log, onClose }) {
  if (!open || !log) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Détails du log</h2>
            <p className="mt-2 text-sm text-slate-500">Informations complètes sur cette activité.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm border border-stone-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-stone-50"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Action</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{log.action || "-"}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Couleur</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{log.color || "-"}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Utilisateur</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{log.user?.pseudo || "Système"}</p>
            <p className="mt-1 text-sm text-slate-500">{log.user?.email || "-"}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Date</p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {log.created_at ? new Date(log.created_at).toLocaleString("fr-FR") : "-"}
            </p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Méthode</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{log.method || "-"}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Code statut</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{log.status_code ?? "-"}</p>
          </div>
        </div>

        <div className="mt-4 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Message</p>
          <p className="mt-2 text-sm text-slate-800">{log.message || "-"}</p>
        </div>

        <div className="mt-4 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Route</p>
          <p className="mt-2 break-all text-sm text-slate-800">{log.route || "-"}</p>
        </div>

        <div className="mt-4 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Entity Type</p>
          <p className="mt-2 break-all text-sm text-slate-800">{log.entity_type || "-"}</p>
        </div>

        <div className="mt-4 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Metadata</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
            {JSON.stringify(log.metadata || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmLog, setConfirmLog] = useState(null);
  const [detailsLog, setDetailsLog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page, pageSize]);

  async function loadLogs() {
    setLoading(true);
    setError("");

    try {
      const result = await fetchActivityLogs({ per_page: pageSize, page });
      setLogs(result.items);
      setTotalPages(result.meta.last_page || 1);
      setPage(result.meta.current_page || 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de charger les activity logs.");
      setLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(log) {
    setActionLoading(true);
    setError("");

    try {
      await deleteActivityLog(log.encrypted_id);
      setNotice("Activity log supprimé.");
      setConfirmLog(null);
      await loadLogs();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Échec de la suppression du log.");
    } finally {
      setActionLoading(false);
    }
  }

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return logs;
    }

    return logs.filter((log) =>
      [
        log.action,
        log.message,
        log.method,
        log.route,
        log.status_code,
        log.color,
        log.user?.pseudo,
        log.user?.email,
        log.entity_type,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [logs, search]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Activity Logs</h2>
            <p className="mt-2 text-sm text-slate-500">
              Historique des actions administrateur avec message, utilisateur, route et statut.
            </p>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">

                          <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition"
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>

            <div className="flex flex-col gap-3 sm:flex-row">
<input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un log..."
              className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-80"
            />
              <button
                type="button"
                onClick={loadLogs}
                className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800"
              >
                Rafraîchir
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
              <EmptyState title="Chargement..." description="Les activity logs sont en cours de récupération depuis l'API." />
            ) : filteredLogs.length === 0 ? (
              <EmptyState title="Aucun activity log" description="Aucun log ne correspond à la recherche actuelle." />
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-sm border border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-light text-left text-xs uppercase tracking-[0.18em]">
                        <tr>
                          <th className="px-5 py-4 text-slate-500">Action</th>
                          <th className="px-5 py-4 text-slate-500">Message</th>
                          <th className="px-5 py-4 text-slate-500">Utilisateur</th>
                          <th className="px-5 py-4 text-slate-500">Statut</th>
                          <th className="px-5 py-4 text-slate-500">Date</th>
                          <th className="px-5 py-4 text-right text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white">
                        {filteredLogs.map((log) => (
                          <tr key={log.encrypted_id || log.id} className="align-top">
                            <td className="px-5 py-4">
                              <div className="space-y-2">
                                <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]", colorClass(log.color))}>
                                  {log.action}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="max-w-lg text-sm font-semibold text-slate-800">{log.message || "-"}</p>
                              <p className="mt-1 text-xs text-slate-500">{log.entity_type || "-"}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">
                              <p className="font-bold text-slate-900">{log.user?.pseudo || "Système"}</p>
                              <p className="mt-1 text-slate-500">{log.user?.email || "-"}</p>
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-slate-700">{log.status_code ?? "-"}</td>
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {log.created_at ? new Date(log.created_at).toLocaleString("fr-FR") : "-"}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setDetailsLog(log)}
                                  className="rounded-sm border border-stone-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-black hover:text-white"
                                >
                                  Afficher détails
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmLog(log)}
                                  className="rounded-sm border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
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

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Page <span className="font-bold text-slate-800">{page}</span> sur{" "}
                    <span className="font-bold text-slate-800">{totalPages}</span>
                  </p>

                  <div className="inline-flex overflow-hidden rounded-sm border border-stone-300 bg-white">
                    <button
                      type="button"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="inline-flex h-10 w-10 items-center justify-center text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon name="chevrons-left" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page === 1}
                      className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon name="chevron-left" className="h-4 w-4" />
                    </button>
                    <div className="inline-flex min-w-24 items-center justify-center border-l border-stone-300 px-3 text-sm font-bold text-slate-700">
                      {page} / {totalPages}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      disabled={page === totalPages}
                      className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon name="chevron-right" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon name="chevrons-right" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ConfirmModal
        open={Boolean(confirmLog)}
        title="Supprimer le log"
        message={confirmLog ? `Voulez-vous supprimer le log "${confirmLog.action}" ?` : ""}
        confirmText="Oui, supprimer"
        loading={actionLoading}
        onCancel={() => (actionLoading ? undefined : setConfirmLog(null))}
        onConfirm={() => handleDelete(confirmLog)}
      />

      <DetailsModal open={Boolean(detailsLog)} log={detailsLog} onClose={() => setDetailsLog(null)} />
    </div>
  );
}
