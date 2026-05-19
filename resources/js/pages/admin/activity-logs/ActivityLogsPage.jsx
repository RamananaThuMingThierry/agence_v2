import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../hooks/admin/I18nContext";
import { deleteActivityLog, fetchActivityLogs } from "../../../api/activityLogs";
import { ActionButton } from "../../../components/admin/TableActions";

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

function ConfirmModal({ open, title, message, confirmText, cancelText, loadingText, loading, closeLabel, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={closeLabel}
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
            {cancelText}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailsModal({ open, log, labels, locale, onClose }) {
  if (!open || !log) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={labels.close}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">{labels.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{labels.description}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm border border-stone-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-stone-50"
            onClick={onClose}
          >
            {labels.close}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.action}</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{log.action || "-"}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.color}</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{log.color || "-"}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.user}</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{log.user?.pseudo || labels.system}</p>
            <p className="mt-1 text-sm text-slate-500">{log.user?.email || "-"}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.date}</p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {log.created_at ? new Date(log.created_at).toLocaleString(locale) : "-"}
            </p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.method}</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{log.method || "-"}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.status_code}</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{log.status_code ?? "-"}</p>
          </div>
        </div>

        <div className="mt-4 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.message}</p>
          <p className="mt-2 text-sm text-slate-800">{log.message || "-"}</p>
        </div>

        <div className="mt-4 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.route}</p>
          <p className="mt-2 break-all text-sm text-slate-800">{log.route || "-"}</p>
        </div>

        <div className="mt-4 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.entity_type}</p>
          <p className="mt-2 break-all text-sm text-slate-800">{log.entity_type || "-"}</p>
        </div>

        <div className="mt-4 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{labels.metadata}</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
            {JSON.stringify(log.metadata || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function ActivityLogsPage() {
  const { t, locale } = useI18n();
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
      setError(requestError.response?.data?.message || t("activity_logs.list.load_error"));
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
      setNotice(t("activity_logs.list.delete_success"));
      setConfirmLog(null);
      await loadLogs();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("activity_logs.list.delete_error"));
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
            <h2 className="text-2xl font-extrabold text-slate-950">{t("activity_logs.list.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {t("activity_logs.list.description")}
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
                  {t("activity_logs.list.per_page", { count: size })}
                </option>
              ))}
            </select>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("activity_logs.list.search_placeholder")}
                className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-80"
              />
              <button
                type="button"
                onClick={loadLogs}
                className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800"
              >
                {t("activity_logs.common.refresh")}
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
              <EmptyState title={t("activity_logs.list.loading_title")} description={t("activity_logs.list.loading_description")} />
            ) : filteredLogs.length === 0 ? (
              <EmptyState title={t("activity_logs.list.empty_title")} description={t("activity_logs.list.empty_description")} />
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-sm border border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-light text-left text-xs uppercase tracking-[0.18em]">
                        <tr>
                          <th className="px-5 py-4 text-slate-500">{t("activity_logs.list.table.action")}</th>
                          <th className="px-5 py-4 text-slate-500">{t("activity_logs.list.table.message")}</th>
                          <th className="px-5 py-4 text-slate-500">{t("activity_logs.list.table.user")}</th>
                          <th className="px-5 py-4 text-slate-500">{t("activity_logs.list.table.status")}</th>
                          <th className="px-5 py-4 text-slate-500">{t("activity_logs.list.table.date")}</th>
                          <th className="px-5 py-4 text-right text-slate-500">{t("activity_logs.list.table.actions")}</th>
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
                              <p className="font-bold text-slate-900">{log.user?.pseudo || t("activity_logs.list.table.system")}</p>
                              <p className="mt-1 text-slate-500">{log.user?.email || "-"}</p>
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-slate-700">{log.status_code ?? "-"}</td>
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {log.created_at ? new Date(log.created_at).toLocaleString(locale) : "-"}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap justify-end gap-2">
                                <ActionButton onClick={() => setDetailsLog(log)} title={t("activity_logs.list.table.show_details")} icon="details" tone="dark" />
                                <ActionButton onClick={() => setConfirmLog(log)} title={t("activity_logs.common.delete")} icon="delete" tone="subtleDanger" />
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
                    {t("activity_logs.list.pagination.page_of", { current: page, total: totalPages })}
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
        title={t("activity_logs.list.delete_modal.title")}
        message={confirmLog ? t("activity_logs.list.delete_modal.message", { name: confirmLog.action }) : ""}
        confirmText={t("activity_logs.list.delete_modal.confirm")}
        cancelText={t("activity_logs.common.cancel")}
        loadingText={t("activity_logs.list.delete_modal.loading")}
        closeLabel={t("activity_logs.common.close")}
        loading={actionLoading}
        onCancel={() => (actionLoading ? undefined : setConfirmLog(null))}
        onConfirm={() => handleDelete(confirmLog)}
      />

      <DetailsModal
        open={Boolean(detailsLog)}
        log={detailsLog}
        locale={locale}
        labels={{
          title: t("activity_logs.details.title"),
          description: t("activity_logs.details.description"),
          close: t("activity_logs.common.close"),
          action: t("activity_logs.details.fields.action"),
          color: t("activity_logs.details.fields.color"),
          user: t("activity_logs.details.fields.user"),
          system: t("activity_logs.list.table.system"),
          date: t("activity_logs.details.fields.date"),
          method: t("activity_logs.details.fields.method"),
          status_code: t("activity_logs.details.fields.status_code"),
          message: t("activity_logs.details.fields.message"),
          route: t("activity_logs.details.fields.route"),
          entity_type: t("activity_logs.details.fields.entity_type"),
          metadata: t("activity_logs.details.fields.metadata"),
        }}
        onClose={() => setDetailsLog(null)}
      />
    </div>
  );
}
