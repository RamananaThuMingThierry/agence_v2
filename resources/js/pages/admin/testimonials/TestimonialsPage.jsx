import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../../../hooks/admin/I18nContext";
import {
  deleteTestimonial,
  fetchTestimonials,
  forceDeleteTestimonial,
  restoreTestimonial,
  updateTestimonial,
} from "../../../api/testimonials";
import { ActionButton } from "../../../components/admin/TableActions";

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

function StatusModal({ open, testimonial, loading, labels, onCancel, onConfirm }) {
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
        aria-label={labels.close}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{labels.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{labels.description.replace(":name", testimonial.name)}</p>
        </div>

        <label className="block space-y-2">
          <span className="block text-sm font-bold text-slate-800">{labels.field}</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={loading}
            className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="publish">{labels.publish}</option>
            <option value="archived">{labels.archived}</option>
          </select>
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
            disabled={loading}
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onConfirm(status)}
            disabled={loading}
          >
            {loading ? labels.saving : labels.submit}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ deletedAt, status, labels }) {
  if (deletedAt) {
    return <span className="inline-flex rounded-sm bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">{labels.trashed}</span>;
  }

  if (status === "archived") {
    return <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">{labels.archived}</span>;
  }

  return <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-green-700">{labels.publish}</span>;
}

export default function TestimonialsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
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
      setError(requestError.response?.data?.message || t("testimonials.list.load_error"));
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }

  function openConfirm(action, testimonial) {
    const config = {
      delete: {
        title: t("testimonials.list.confirm.delete_title"),
        message: t("testimonials.list.confirm.delete_message", { name: testimonial.name }),
        confirmText: t("testimonials.list.confirm.delete_confirm"),
      },
      restore: {
        title: t("testimonials.list.confirm.restore_title"),
        message: t("testimonials.list.confirm.restore_message", { name: testimonial.name }),
        confirmText: t("testimonials.list.confirm.restore_confirm"),
      },
      force: {
        title: t("testimonials.list.confirm.force_title"),
        message: t("testimonials.list.confirm.force_message", { name: testimonial.name }),
        confirmText: t("testimonials.list.confirm.force_confirm"),
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
        setNotice(t("testimonials.list.delete_success"));
      } else if (confirmState.action === "restore") {
        await restoreTestimonial(confirmState.testimonial.encrypted_id);
        setNotice(t("testimonials.list.restore_success"));
      } else if (confirmState.action === "force") {
        await forceDeleteTestimonial(confirmState.testimonial.encrypted_id);
        setNotice(t("testimonials.list.force_delete_success"));
      }

      setConfirmState(null);
      await loadTestimonials();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("testimonials.list.action_error"));
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
      setNotice(t("testimonials.list.status_updated"));
      await loadTestimonials();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("testimonials.list.status_update_error"));
    } finally {
      setActionLoading(false);
    }
  }

  const filteredTestimonials = useMemo(() => {
    const query = search.trim().toLowerCase();
    const baseItems = testimonials.filter((testimonial) => {
      if (filter === "publish") return !testimonial.deleted_at && testimonial.status === "publish";
      if (filter === "archived") return !testimonial.deleted_at && testimonial.status === "archived";
      if (filter === "all") return !testimonial.deleted_at;
      if (filter === "trashed") return Boolean(testimonial.deleted_at);
      return true;
    });

    if (!query) return baseItems;

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
            <h2 className="text-2xl font-extrabold text-slate-950">{t("testimonials.list.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("testimonials.list.description")}</p>
          </div>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("testimonials.list.stats.published")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.publish}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("testimonials.list.stats.archived")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.archived}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("testimonials.list.stats.trashed")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.trashed}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("testimonials.list.stats.total")}</p>
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
                <option value="all">{t("testimonials.list.filters.all")}</option>
                <option value="publish">{t("testimonials.list.filters.published")}</option>
                <option value="archived">{t("testimonials.list.filters.archived")}</option>
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
                {t("testimonials.list.filters.trashed")}
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("testimonials.list.search_placeholder")}
                className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-80"
              />
              <button
                type="button"
                onClick={loadTestimonials}
                className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800"
              >
                {t("testimonials.common.refresh")}
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
              <EmptyState title={t("testimonials.list.loading_title")} description={t("testimonials.list.loading_description")} />
            ) : filteredTestimonials.length === 0 ? (
              <EmptyState title={t("testimonials.list.empty_title")} description={t("testimonials.list.empty_description")} />
            ) : (
              <div className="overflow-hidden rounded-sm border border-stone-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50 text-left">
                      <tr>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("testimonials.list.table.client")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("testimonials.list.table.message")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("testimonials.list.table.rating")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("testimonials.list.table.status")}</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("testimonials.list.table.created_at")}</th>
                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("testimonials.list.table.actions")}</th>
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
                            <StatusBadge
                              deletedAt={testimonial.deleted_at}
                              status={testimonial.status}
                              labels={{
                                trashed: t("testimonials.status.trashed"),
                                archived: t("testimonials.status.archived"),
                                publish: t("testimonials.status.publish"),
                              }}
                            />
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">
                            {testimonial.created_at ? new Date(testimonial.created_at).toLocaleDateString(locale) : "-"}
                          </td>
                          <td className="px-5 py-4">
                                <div className="flex flex-wrap justify-end gap-2">
                                  {!testimonial.deleted_at ? (
                                    <>
                                  <ActionButton onClick={() => setStatusModalTestimonial(testimonial)} title={t("testimonials.common.edit")} icon="edit" tone="dark" />
                                  <ActionButton onClick={() => openConfirm("delete", testimonial)} title={t("testimonials.common.delete")} icon="delete" tone="danger" />
                                </>
                              ) : (
                                <>
                                  <ActionButton onClick={() => openConfirm("restore", testimonial)} title={t("testimonials.common.restore")} icon="restore" tone="warning" />
                                  <ActionButton onClick={() => openConfirm("force", testimonial)} title={t("testimonials.common.permanent")} icon="force" tone="subtleDanger" />
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
        confirmText={confirmState?.confirmText || t("testimonials.common.confirm")}
        cancelText={t("testimonials.common.cancel")}
        loadingText={t("testimonials.common.saving")}
        closeLabel={t("testimonials.common.close")}
        loading={actionLoading}
        onCancel={() => (actionLoading ? undefined : setConfirmState(null))}
        onConfirm={handleConfirmAction}
      />
      <StatusModal
        open={Boolean(statusModalTestimonial)}
        testimonial={statusModalTestimonial}
        loading={actionLoading}
        labels={{
          close: t("testimonials.common.close"),
          title: t("testimonials.list.status_modal.title"),
          description: t("testimonials.list.status_modal.description"),
          field: t("testimonials.list.status_modal.field"),
          publish: t("testimonials.status.publish"),
          archived: t("testimonials.status.archived"),
          cancel: t("testimonials.common.cancel"),
          saving: t("testimonials.common.saving"),
          submit: t("testimonials.common.update"),
        }}
        onCancel={() => (actionLoading ? undefined : setStatusModalTestimonial(null))}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
}
