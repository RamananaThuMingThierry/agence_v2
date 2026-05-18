import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteGallery, fetchGalleries } from "../../../api/galleries";

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

function SortableHead({ label, column, sortBy, sortDirection, onSort }) {
  const active = sortBy === column;

  return (
    <th className="px-5 py-4">
      <button type="button" onClick={() => onSort(column)} className={cn("inline-flex items-center gap-2 font-bold uppercase tracking-[0.18em] transition", active ? "text-slate-800" : "text-slate-500 hover:text-slate-700")}>
        <span>{label}</span>
        <span className="text-[10px]">{active ? (sortDirection === "asc" ? "?" : "?") : "?"}</span>
      </button>
    </th>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={status === "publish" ? "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800" : "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-800"}>
      {status === "publish" ? "Publie" : "Brouillon"}
    </span>
  );
}

export default function GalleriesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmGallery, setConfirmGallery] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadGalleries();
  }, []);

  useEffect(() => {
    if (!location.state?.notice) return;
    setNotice(location.state.notice);
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortDirection, pageSize]);

  async function loadGalleries() {
    setLoading(true);
    setError("");

    try {
      const items = await fetchGalleries();
      setGalleries(items);
    } catch (requestError) {
      setGalleries([]);
      setError(requestError.response?.data?.message || "Impossible de charger les galleries.");
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

  async function handleDelete() {
    if (!confirmGallery) return;

    setActionLoading(true);
    setError("");

    try {
      await deleteGallery(confirmGallery.encrypted_id);
      setNotice("Gallery supprimee.");
      setConfirmGallery(null);
      await loadGalleries();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Echec de la suppression de la gallery.");
    } finally {
      setActionLoading(false);
    }
  }

  const filteredGalleries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return galleries;

    return galleries.filter((gallery) =>
      [gallery.title, gallery.subtitle, gallery.description, gallery.category?.name, gallery.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [galleries, search]);

  const sortedGalleries = useMemo(() => {
    const items = [...filteredGalleries];

    items.sort((left, right) => {
      const leftValue = sortBy === "images"
        ? Number(left.images?.length || 0)
        : sortBy === "created_at"
          ? new Date(left.created_at || 0).getTime()
          : sortBy === "category"
            ? String(left.category?.name || "").toLowerCase()
            : String(left[sortBy] || "").toLowerCase();

      const rightValue = sortBy === "images"
        ? Number(right.images?.length || 0)
        : sortBy === "created_at"
          ? new Date(right.created_at || 0).getTime()
          : sortBy === "category"
            ? String(right.category?.name || "").toLowerCase()
            : String(right[sortBy] || "").toLowerCase();

      if (leftValue < rightValue) return sortDirection === "asc" ? -1 : 1;
      if (leftValue > rightValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [filteredGalleries, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedGalleries.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedGalleries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedGalleries.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedGalleries]);

  const counts = useMemo(() => ({
    total: galleries.length,
    published: galleries.filter((gallery) => gallery.status === "publish").length,
    drafts: galleries.filter((gallery) => gallery.status === "draft").length,
  }), [galleries]);

  return (
    <div className="space-y-2">
      <section className="overflow-hidden rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Gestion des galleries</h2>
            <p className="mt-2 text-sm text-slate-500">Liste des galleries, statut de publication et images de couverture.</p>
          </div>

          <Link to="/admin/galleries/create" className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700">
            Nouvelle gallery
          </Link>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Galleries</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.total}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Publiees</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.published}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Brouillons</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.drafts}</p>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une gallery..." className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-72" />
              <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition">
                {[5, 10, 25, 50].map((size) => <option key={size} value={size}>{size} / page</option>)}
              </select>
              <button type="button" onClick={loadGalleries} className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800">Rafraichir</button>
            </div>
          </div>

          {notice ? <div className="mt-5 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</div> : null}
          {error ? <div className="mt-5 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

          <div className="mt-3">
            {loading ? (
              <EmptyState title="Chargement..." description="Les galleries sont en cours de recuperation depuis l'API." />
            ) : sortedGalleries.length === 0 ? (
              <EmptyState title="Aucune gallery" description="Aucune gallery ne correspond a la recherche actuelle." />
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-sm border border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-light text-left text-xs uppercase tracking-[0.18em]">
                        <tr>
                          <th className="px-5 py-4 text-slate-500">Cover</th>
                          <SortableHead label="Titre" column="title" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label="Categorie" column="category" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label="Statut" column="status" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label="Images" column="images" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label="Creation" column="created_at" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <th className="px-5 py-4 text-right text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white">
                        {paginatedGalleries.map((gallery) => {
                          const cover = gallery.images?.find((image) => image.is_cover) || gallery.images?.[0];

                          return (
                            <tr key={gallery.encrypted_id || gallery.id} className="align-top">
                              <td className="px-5 py-4">
                                <div className="h-16 w-24 overflow-hidden rounded-sm bg-stone-100">
                                  <img src={buildImageUrl(cover?.image_url)} alt={gallery.title} className="h-full w-full object-cover" />
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <p className="font-extrabold text-slate-950">{gallery.title}</p>
                                <p className="mt-1 max-w-md text-sm text-slate-500">{gallery.subtitle || "Sans sous-titre"}</p>
                              </td>
                              <td className="px-5 py-4 text-sm font-bold text-slate-700">{gallery.category?.name || "-"}</td>
                              <td className="px-5 py-4"><StatusBadge status={gallery.status} /></td>
                              <td className="px-5 py-4 text-sm text-slate-600">{gallery.images?.length || 0}</td>
                              <td className="px-5 py-4 text-sm text-slate-500">{gallery.created_at ? new Date(gallery.created_at).toLocaleDateString("fr-FR") : "-"}</td>
                              <td className="px-5 py-4">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <Link to={`/admin/galleries/${gallery.encrypted_id}`} className="rounded-sm border border-stone-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-stone-100">Details</Link>
                                  <Link to={`/admin/galleries/${gallery.encrypted_id}/edit`} className="rounded-sm border px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-black hover:text-white">Modifier</Link>
                                  <button type="button" onClick={() => setConfirmGallery(gallery)} className="rounded-sm border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-red-600 hover:text-white">Supprimer</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">Page <span className="font-bold text-slate-800">{currentPage}</span> sur <span className="font-bold text-slate-800">{totalPages}</span></p>
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
        open={Boolean(confirmGallery)}
        title="Supprimer la gallery"
        message={confirmGallery ? `Voulez-vous supprimer la gallery "${confirmGallery.title}" ?` : ""}
        confirmText="Oui, supprimer"
        loading={actionLoading}
        onCancel={() => (actionLoading ? undefined : setConfirmGallery(null))}
        onConfirm={handleDelete}
      />
    </div>
  );
}
