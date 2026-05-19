import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../../../hooks/admin/I18nContext";
import { deleteCategory, fetchCategories } from "../../../api/categories";
import { ActionButton, ActionLink } from "../../../components/admin/TableActions";

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
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-2 font-bold uppercase tracking-[0.18em] transition",
          active ? "text-slate-800" : "text-slate-500 hover:text-slate-700",
        )}
      >
        <span>{label}</span>
        <span className="text-[10px]">{active ? (sortDirection === "asc" ? "ASC" : "DESC") : "SORT"}</span>
      </button>
    </th>
  );
}

export default function CategoriesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmCategory, setConfirmCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!location.state?.notice) return;
    setNotice(location.state.notice);
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortDirection, pageSize]);

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const items = await fetchCategories();
      setCategories(items);
    } catch (requestError) {
      setCategories([]);
      setError(requestError.response?.data?.message || t("categories.list.load_error"));
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

  async function handleDelete(category) {
    setActionLoading(true);
    setError("");

    try {
      await deleteCategory(category.encrypted_id);
      setNotice(t("categories.list.delete_success"));
      setConfirmCategory(null);
      await loadCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("categories.list.delete_error"));
    } finally {
      setActionLoading(false);
    }
  }

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) =>
      [category.name, category.description, category.is_active ? "active" : "inactive"]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [categories, search]);

  const sortedCategories = useMemo(() => {
    const items = [...filteredCategories];

    items.sort((left, right) => {
      const leftValue =
        sortBy === "is_active"
          ? Number(Boolean(left.is_active))
          : sortBy === "created_at"
            ? new Date(left.created_at || 0).getTime()
            : String(left[sortBy] || "").toLowerCase();

      const rightValue =
        sortBy === "is_active"
          ? Number(Boolean(right.is_active))
          : sortBy === "created_at"
            ? new Date(right.created_at || 0).getTime()
            : String(right[sortBy] || "").toLowerCase();

      if (leftValue < rightValue) return sortDirection === "asc" ? -1 : 1;
      if (leftValue > rightValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [filteredCategories, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedCategories.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCategories.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedCategories]);

  const counts = useMemo(
    () => ({
      active: categories.filter((category) => Boolean(category.is_active)).length,
      inactive: categories.filter((category) => !category.is_active).length,
      total: categories.length,
    }),
    [categories],
  );

  return (
    <div className="space-y-2">
      <section className="overflow-hidden rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">{t("categories.list.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("categories.list.description")}</p>
          </div>

          <Link to="/admin/categories/create" className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700">
            {t("categories.common.new")}
          </Link>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("categories.list.stats.active")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.active}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("categories.list.stats.inactive")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.inactive}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("categories.list.stats.total")}</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.total}</p>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("categories.list.search_placeholder")} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-72" />
              <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition">
                {[5, 10, 25, 50].map((size) => (
                  <option key={size} value={size}>{t("categories.list.per_page", { count: size })}</option>
                ))}
              </select>
              <button type="button" onClick={loadCategories} className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800">{t("categories.common.refresh")}</button>
            </div>
          </div>

          {notice ? <div className="mt-5 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</div> : null}
          {error ? <div className="mt-5 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

          <div className="mt-3">
            {loading ? (
              <EmptyState title={t("categories.list.loading_title")} description={t("categories.list.loading_description")} />
            ) : sortedCategories.length === 0 ? (
              <EmptyState title={t("categories.list.empty_title")} description={t("categories.list.empty_description")} />
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-sm border border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-light text-left text-xs uppercase tracking-[0.18em]">
                        <tr>
                          <SortableHead label={t("categories.list.table.name")} column="name" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <th className="px-5 py-4 text-slate-500">{t("categories.list.table.description")}</th>
                          <SortableHead label={t("categories.list.table.status")} column="is_active" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label={t("categories.list.table.created_at")} column="created_at" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <th className="px-5 py-4 text-right text-slate-500">{t("categories.list.table.actions")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white">
                        {paginatedCategories.map((category) => (
                          <tr key={category.encrypted_id || category.id} className="align-top">
                            <td className="px-5 py-4 text-sm font-bold text-slate-900">{category.name}</td>
                            <td className="px-5 py-4 text-sm text-slate-600">{category.description || t("categories.list.table.no_description")}</td>
                            <td className="px-5 py-4">
                              <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]", category.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                                {category.is_active ? t("categories.status.active") : t("categories.status.inactive")}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500">{category.created_at ? new Date(category.created_at).toLocaleDateString(locale) : "-"}</td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap justify-end gap-2">
                                <ActionLink to={`/admin/categories/${category.encrypted_id}/edit`} title={t("categories.common.edit")} icon="edit" tone="dark" />
                                <ActionButton onClick={() => setConfirmCategory(category)} title={t("categories.common.delete")} icon="delete" tone="danger" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">{t("categories.list.pagination.page_of", { current: currentPage, total: totalPages })}</p>
                  <div className="inline-flex overflow-hidden rounded-sm border border-stone-300 bg-white">
                    <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1} className="inline-flex h-10 w-10 items-center justify-center text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50">{"<<"}</button>
                    <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage === 1} className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50">{"<"}</button>
                    <div className="inline-flex min-w-24 items-center justify-center border-l border-stone-300 px-3 text-sm font-bold text-slate-700">{currentPage} / {totalPages}</div>
                    <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={currentPage === totalPages} className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50">{">"}</button>
                    <button type="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50">{">>"}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ConfirmModal
        open={Boolean(confirmCategory)}
        title={t("categories.list.delete_modal.title")}
        message={confirmCategory ? t("categories.list.delete_modal.message", { name: confirmCategory.name }) : ""}
        confirmText={t("categories.list.delete_modal.confirm")}
        cancelText={t("categories.common.cancel")}
        loadingText={t("categories.list.delete_modal.loading")}
        closeLabel={t("categories.common.close")}
        loading={actionLoading}
        onCancel={() => (actionLoading ? undefined : setConfirmCategory(null))}
        onConfirm={() => handleDelete(confirmCategory)}
      />
    </div>
  );
}
