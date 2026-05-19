import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../../../hooks/admin/I18nContext";
import { deleteTour, fetchTours, forceDeleteTour, restoreTour } from "../../../api/tours";
import { ActionButton, ActionLink } from "../../../components/admin/TableActions";
import { formatUsd } from "../../../utils/currency";

function buildImageUrl(path) {
  if (!path) return "/images/profil.png";
  if (/^https?:\/\//i.test(path)) return path;
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
      <button type="button" aria-label={closeLabel} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" onClick={onCancel} disabled={loading}>{cancelText}</button>
          <button type="button" className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" onClick={onConfirm} disabled={loading}>{loading ? loadingText : confirmText}</button>
        </div>
      </div>
    </div>
  );
}

function SortableHead({ label, column, sortBy, sortDirection, onSort }) {
  const active = sortBy === column;

  return (
    <th className="px-5 py-4">
      <button type="button" onClick={() => onSort(column)} className={cn("inline-flex items-center gap-2 font-bold uppercase tracking-[0.18em] transition", active ? "text-slate-800" : "text-slate-500 hover:text-slate-700")}>
        <span>{label}</span>
        <span className="text-[10px]">{active ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

function StatusBadge({ status, deletedAt, labels }) {
  if (deletedAt) {
    return <span className="inline-flex rounded-sm bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">{labels.trashed}</span>;
  }

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]", status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
      {status === "active" ? labels.active : labels.inactive}
    </span>
  );
}

export default function ToursPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmState, setConfirmState] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTours();
  }, [filter]);

  useEffect(() => {
    if (!location.state?.notice) return;
    setNotice(location.state.notice);
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    setPage(1);
  }, [search, filter, sortBy, sortDirection, pageSize]);

  async function loadTours() {
    setLoading(true);
    setError("");

    try {
      const items = await fetchTours({
        with_trashed: false,
        only_trashed: filter === "trashed",
      });
      setTours(items);
    } catch (requestError) {
      setTours([]);
      setError(requestError.response?.data?.message || t("tours.list.load_error"));
    } finally {
      setLoading(false);
    }
  }

  function handleSort(column) {
    if (sortBy === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(column);
    setSortDirection(column === "created_at" ? "desc" : "asc");
  }

  function openConfirm(action, tour) {
    const config = {
      delete: {
        title: t("tours.list.confirm.delete_title"),
        message: t("tours.list.confirm.delete_message", { name: tour.title }),
        confirmText: t("tours.list.confirm.delete_confirm"),
      },
      restore: {
        title: t("tours.list.confirm.restore_title"),
        message: t("tours.list.confirm.restore_message", { name: tour.title }),
        confirmText: t("tours.list.confirm.restore_confirm"),
      },
      force: {
        title: t("tours.list.confirm.force_title"),
        message: t("tours.list.confirm.force_message", { name: tour.title }),
        confirmText: t("tours.list.confirm.force_confirm"),
      },
    };

    setConfirmState({ action, tour, ...config[action] });
  }

  async function handleConfirmAction() {
    if (!confirmState) return;
    setActionLoading(true);
    setError("");

    try {
      if (confirmState.action === "delete") {
        await deleteTour(confirmState.tour.encrypted_id);
        setNotice(t("tours.list.delete_success"));
      } else if (confirmState.action === "restore") {
        await restoreTour(confirmState.tour.encrypted_id);
        setNotice(t("tours.list.restore_success"));
      } else if (confirmState.action === "force") {
        await forceDeleteTour(confirmState.tour.encrypted_id);
        setNotice(t("tours.list.force_delete_success"));
      }

      setConfirmState(null);
      await loadTours();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("tours.list.action_error"));
    } finally {
      setActionLoading(false);
    }
  }

  const filteredTours = useMemo(() => {
    const query = search.trim().toLowerCase();
    const baseTours = tours.filter((tour) => {
      if (filter === "active") return !tour.deleted_at && tour.status === "active";
      if (filter === "inactive") return !tour.deleted_at && tour.status === "inactive";
      if (filter === "all") return !tour.deleted_at;
      if (filter === "trashed") return Boolean(tour.deleted_at);
      return true;
    });

    if (!query) return baseTours;

    return baseTours.filter((tour) =>
      [tour.title, tour.category, tour.duration, tour.start_location, tour.end_location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [filter, search, tours]);

  const sortedTours = useMemo(() => {
    const items = [...filteredTours];
    items.sort((left, right) => {
      const leftValue = sortBy === "price"
        ? Number(left.price || 0)
        : sortBy === "images"
          ? Number(left.images?.length || 0)
          : sortBy === "created_at"
            ? new Date(left.created_at || 0).getTime()
            : String(left[sortBy] || "").toLowerCase();
      const rightValue = sortBy === "price"
        ? Number(right.price || 0)
        : sortBy === "images"
          ? Number(right.images?.length || 0)
          : sortBy === "created_at"
            ? new Date(right.created_at || 0).getTime()
            : String(right[sortBy] || "").toLowerCase();

      if (leftValue < rightValue) return sortDirection === "asc" ? -1 : 1;
      if (leftValue > rightValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return items;
  }, [filteredTours, sortBy, sortDirection]);

  const counts = useMemo(() => ({
    active: tours.filter((tour) => !tour.deleted_at && tour.status === "active").length,
    trashed: tours.filter((tour) => Boolean(tour.deleted_at)).length,
    total: tours.length,
  }), [tours]);

  const totalPages = Math.max(1, Math.ceil(sortedTours.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedTours = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTours.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedTours]);

  return (
    <div className="space-y-2">
      <section className="overflow-hidden rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">{t("tours.list.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("tours.list.description")}</p>
          </div>

          <Link to="/admin/tours/create" className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700">{t("tours.common.new")}</Link>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("tours.list.stats.active")}</p><p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.active}</p></div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("tours.list.stats.trashed")}</p><p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.trashed}</p></div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("tours.list.stats.total")}</p><p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.total}</p></div>
        </div>

        <div className="mt-3 overflow-hidden rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select value={filter === "trashed" ? "all" : filter} onChange={(event) => setFilter(event.target.value)} className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition">
                <option value="all">{t("tours.list.filters.all")}</option>
                <option value="active">{t("tours.list.filters.active")}</option>
                <option value="inactive">{t("tours.list.filters.inactive")}</option>
              </select>
              <button type="button" onClick={() => setFilter("trashed")} className={cn("rounded-sm px-4 py-3 text-sm font-bold transition", filter === "trashed" ? "bg-red-600 text-white" : "border border-stone-300 bg-white text-slate-700 hover:border-red-300 hover:text-red-800")}>{t("tours.list.filters.trashed")}</button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("tours.list.search_placeholder")} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-72" />
              <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition">{[5, 10, 25, 50].map((size) => <option key={size} value={size}>{t("tours.list.per_page", { count: size })}</option>)}</select>
              <button type="button" onClick={loadTours} className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800">{t("tours.common.refresh")}</button>
            </div>
          </div>

          {notice ? <div className="mt-5 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</div> : null}
          {error ? <div className="mt-5 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

          <div className="mt-3">
            {loading ? (
              <EmptyState title={t("tours.list.loading_title")} description={t("tours.list.loading_description")} />
            ) : sortedTours.length === 0 ? (
              <EmptyState title={t("tours.list.empty_title")} description={t("tours.list.empty_description")} />
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-sm border border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-light text-left text-xs uppercase tracking-[0.18em]">
                        <tr>
                          <th className="px-5 py-4 text-slate-500">{t("tours.list.table.cover")}</th>
                          <SortableHead label={t("tours.list.table.title")} column="title" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label={t("tours.list.table.category")} column="category" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label={t("tours.list.table.price")} column="price" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label={t("tours.list.table.images")} column="images" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label={t("tours.list.table.created_at")} column="created_at" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <th className="px-5 py-4 text-slate-500">{t("tours.list.table.status")}</th>
                          <th className="px-5 py-4 text-right text-slate-500">{t("tours.list.table.actions")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white">
                        {paginatedTours.map((tour) => {
                          const cover = tour.images?.find((image) => image.is_cover) || tour.images?.[0];
                          return (
                            <tr key={tour.encrypted_id || tour.id} className="align-top">
                              <td className="px-5 py-4"><div className="h-16 w-24 overflow-hidden rounded-sm bg-stone-100">{cover ? <img src={buildImageUrl(cover.image_url)} alt={tour.title} className="h-full w-full object-cover" /> : null}</div></td>
                              <td className="px-5 py-4"><p className="font-extrabold text-slate-950">{tour.title}</p><p className="mt-1 max-w-md text-sm text-slate-500">{tour.duration || "-"}</p></td>
                              <td className="px-5 py-4 text-sm font-bold text-slate-700">{tour.category}</td>
                              <td className="px-5 py-4 text-sm font-bold text-slate-700">{formatUsd(tour.price || 0, locale)}</td>
                              <td className="px-5 py-4 text-sm text-slate-600">{tour.images?.length || 0}</td>
                              <td className="px-5 py-4 text-sm text-slate-500">{tour.created_at ? new Date(tour.created_at).toLocaleDateString(locale) : "-"}</td>
                              <td className="px-5 py-4"><StatusBadge status={tour.status} deletedAt={tour.deleted_at} labels={{ active: t("tours.status.active"), inactive: t("tours.status.inactive"), trashed: t("tours.status.trashed") }} /></td>
                              <td className="px-5 py-4"><div className="flex flex-wrap justify-end gap-2">{!tour.deleted_at ? <><ActionLink to={`/admin/tours/${tour.encrypted_id}`} title={t("tours.common.details")} icon="details" /><ActionLink to={`/admin/tours/${tour.encrypted_id}/edit`} title={t("tours.common.edit")} icon="edit" tone="dark" /><ActionButton onClick={() => openConfirm("delete", tour)} title={t("tours.common.delete")} icon="delete" tone="danger" /></> : <><ActionButton onClick={() => openConfirm("restore", tour)} title={t("tours.common.restore")} icon="restore" tone="warning" /><ActionButton onClick={() => openConfirm("force", tour)} title={t("tours.common.permanent")} icon="force" tone="subtleDanger" /></>}</div></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">{t("tours.list.pagination.page_of", { current: currentPage, total: totalPages })}</p>
                  <div className="inline-flex overflow-hidden rounded-sm border border-stone-300 bg-white">
                    <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1} className="inline-flex h-10 w-10 items-center justify-center text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50">{t("tours.list.pagination.first")}</button>
                    <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage === 1} className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50">{t("tours.list.pagination.previous")}</button>
                    <div className="inline-flex min-w-24 items-center justify-center border-l border-stone-300 px-3 text-sm font-bold text-slate-700">{currentPage} / {totalPages}</div>
                    <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={currentPage === totalPages} className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50">{t("tours.list.pagination.next")}</button>
                    <button type="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50">{t("tours.list.pagination.last")}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ConfirmModal open={Boolean(confirmState)} title={confirmState?.title || ""} message={confirmState?.message || ""} confirmText={confirmState?.confirmText || t("tours.common.confirm")} cancelText={t("tours.common.cancel")} loadingText={t("tours.common.processing")} closeLabel={t("tours.common.close")} loading={actionLoading} onCancel={() => (actionLoading ? undefined : setConfirmState(null))} onConfirm={handleConfirmAction} />
    </div>
  );
}
