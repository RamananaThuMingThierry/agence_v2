import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteSlide, fetchSlides, forceDeleteSlide, restoreSlide } from "../../../api/slides";

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
    case "active":
      return (
        <svg {...common}>
          <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>
      );
    case "total":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 9h10" />
          <path d="M7 13h6" />
          <path d="M7 17h8" />
        </svg>
      );
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

function StatusBadge({ deletedAt, isActive }) {
  if (deletedAt) {
    return (
      <span className="inline-flex rounded-sm bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
        Corbeille
      </span>
    );
  }

  if (!isActive) {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-red-700">
        Inactive
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-green-700">
      Active
    </span>
  );
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

function SortableHead({ label, column, sortBy, sortDirection, onSort, align = "left" }) {
  const active = sortBy === column;

  return (
    <th className={cn("px-5 py-4", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-2 font-bold uppercase tracking-[0.18em] transition",
          active ? "text-slate-800" : "text-slate-500 hover:text-slate-700",
        )}
      >
        <span>{label}</span>
        <span className="text-[10px]">{active ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

export default function SlidesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [sortBy, setSortBy] = useState("order");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmState, setConfirmState] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSlides();
  }, [filter]);

  useEffect(() => {
    if (!location.state?.notice) {
      return;
    }

    setNotice(location.state.notice);
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    setPage(1);
  }, [search, filter, pageSize, sortBy, sortDirection]);

  async function loadSlides() {
    setLoading(true);
    setError("");

    try {
      const items = await fetchSlides({
        with_trashed: false,
        only_trashed: filter === "trashed",
      });

      setSlides(items);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de charger les slides.");
      setSlides([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(slide) {
    try {
      await deleteSlide(slide.encrypted_id);
      setNotice("Slide déplacé dans la corbeille.");
      await loadSlides();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Échec de la suppression du slide.");
    }
  }

  async function handleRestore(slide) {
    try {
      await restoreSlide(slide.encrypted_id);
      setNotice("Slide restauré.");
      await loadSlides();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Échec de la restauration du slide.");
    }
  }

  async function handleForceDelete(slide) {
    try {
      await forceDeleteSlide(slide.encrypted_id);
      setNotice("Slide supprimé définitivement.");
      await loadSlides();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Échec de la suppression définitive du slide.");
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

  function openConfirm(action, slide) {
    const config = {
      delete: {
        title: "Supprimer le slide",
        message: `Voulez-vous envoyer "${slide.title}" dans la corbeille ?`,
        confirmText: "Oui, supprimer",
      },
      restore: {
        title: "Restaurer le slide",
        message: `Voulez-vous restaurer "${slide.title}" ?`,
        confirmText: "Oui, restaurer",
      },
      force: {
        title: "Suppression définitive",
        message: `Voulez-vous supprimer définitivement "${slide.title}" et son image ?`,
        confirmText: "Oui, supprimer",
      },
    };

    setConfirmState({
      action,
      slide,
      ...config[action],
    });
  }

  async function handleConfirmAction() {
    if (!confirmState) return;

    setActionLoading(true);

    try {
      if (confirmState.action === "delete") {
        await handleDelete(confirmState.slide);
      } else if (confirmState.action === "restore") {
        await handleRestore(confirmState.slide);
      } else if (confirmState.action === "force") {
        await handleForceDelete(confirmState.slide);
      }

      setConfirmState(null);
    } finally {
      setActionLoading(false);
    }
  }

  const filteredSlides = useMemo(() => {
    const query = search.trim().toLowerCase();
    const baseSlides = slides.filter((slide) => {
      if (filter === "inactive") {
        return !slide.deleted_at && !slide.is_active;
      }

      if (filter === "active") {
        return !slide.deleted_at && Boolean(slide.is_active);
      }

      if (filter === "all") {
        return !slide.deleted_at;
      }

      if (filter === "trashed") {
        return Boolean(slide.deleted_at);
      }

      return true;
    });

    if (!query) {
      return baseSlides;
    }

    return baseSlides.filter((slide) =>
      [slide.title, slide.subtitle, slide.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [filter, search, slides]);

  const sortedSlides = useMemo(() => {
    const items = [...filteredSlides];

    items.sort((left, right) => {
      const leftValue =
        sortBy === "status"
          ? left.deleted_at
            ? 2
            : left.is_active
              ? 1
              : 0
          : sortBy === "created_at"
            ? new Date(left.created_at || 0).getTime()
            : sortBy === "title"
              ? String(left.title || "").toLowerCase()
              : Number(left.order || 0);

      const rightValue =
        sortBy === "status"
          ? right.deleted_at
            ? 2
            : right.is_active
              ? 1
              : 0
          : sortBy === "created_at"
            ? new Date(right.created_at || 0).getTime()
            : sortBy === "title"
              ? String(right.title || "").toLowerCase()
              : Number(right.order || 0);

      if (leftValue < rightValue) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

    return items;
  }, [filteredSlides, sortBy, sortDirection]);

  const counts = useMemo(
    () => ({
      active: slides.filter((slide) => !slide.deleted_at && slide.is_active).length,
      trashed: slides.filter((slide) => Boolean(slide.deleted_at)).length,
      total: slides.length,
    }),
    [slides],
  );

  const totalPages = Math.max(1, Math.ceil(sortedSlides.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedSlides = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSlides.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedSlides]);

  return (
    <div className="space-y-2">
      <section className="overflow-hidden rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Gestion des slides</h2>
            <p className="mt-2 text-sm text-slate-500">
              Liste des slides en datatable avec recherche, tri, pagination et actions rapides.
            </p>
          </div>

          <Link
            to="/admin/slides/create"
            className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Nouveau slide
          </Link>
        </div>

        <div className="mt-3 grid gap-4 border-stone-200 md:grid-cols-3">
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Actifs</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.active}</p>
              </div>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-red-200 text-red-600">
                <Icon name="active" />
              </span>
            </div>
          </div>

          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Corbeille</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.trashed}</p>
              </div>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-red-200 text-red-600">
                <Icon name="trash" />
              </span>
            </div>
          </div>

          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.total}</p>
              </div>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-red-200 text-red-600">
                <Icon name="total" />
              </span>
            </div>
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
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
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
                placeholder="Rechercher un slide..."
                className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition sm:w-72"
              />
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition"
              >
                {[5, 10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadSlides}
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
              <EmptyState title="Chargement..." description="Les slides sont en cours de récupération depuis l'API." />
            ) : sortedSlides.length === 0 ? (
              <EmptyState
                title="Aucun slide trouvé"
                description="Essaie de modifier la recherche ou ajoute un nouveau slide depuis le bouton en haut à droite."
              />
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-sm border border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-light text-left text-xs uppercase tracking-[0.18em]">
                        <tr>
                          <th className="px-5 py-4 text-slate-500">Slide</th>
                          <SortableHead label="Titre" column="title" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label="Ordre" column="order" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label="Statut" column="status" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label="Création" column="created_at" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <th className="px-5 py-4 text-right text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white">
                        {paginatedSlides.map((slide) => (
                          <tr key={slide.encrypted_id || slide.id} className="align-top">
                            <td className="px-5 py-4">
                              <div className="h-16 w-24 overflow-hidden rounded-sm bg-stone-100">
                                {slide.image ? (
                                  <img src={buildImageUrl(slide.image)} alt={slide.title} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    No image
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-extrabold text-slate-950">{slide.title}</p>
                              <p className="mt-1 max-w-md text-sm text-slate-500">{slide.subtitle || "Sans sous-titre"}</p>
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-slate-700">{slide.order ?? 0}</td>
                            <td className="px-5 py-4">
                              <StatusBadge deletedAt={slide.deleted_at} isActive={slide.is_active} />
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {slide.created_at ? new Date(slide.created_at).toLocaleDateString("fr-FR") : "-"}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap justify-end gap-2">
                                {!slide.deleted_at ? (
                                  <>
                                    <Link
                                      to={`/admin/slides/${slide.encrypted_id}/edit`}
                                      className="rounded-sm border px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-black hover:text-white"
                                    >
                                      Modifier
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => openConfirm("delete", slide)}
                                      className="rounded-sm border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-red-600 hover:text-white"
                                    >
                                      Supprimer
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openConfirm("restore", slide)}
                                      className="rounded-sm border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
                                    >
                                      Restaurer
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openConfirm("force", slide)}
                                      className="rounded-sm border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                                    >
                                      Définitif
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

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Page <span className="font-bold text-slate-800">{currentPage}</span> sur{" "}
                    <span className="font-bold text-slate-800">{totalPages}</span>
                  </p>

                  <div className="inline-flex overflow-hidden rounded-sm border border-stone-300 bg-white">
                    <button
                      type="button"
                      onClick={() => setPage(1)}
                      disabled={currentPage === 1}
                      title="Début"
                      aria-label="Aller à la première page"
                      className="inline-flex h-10 w-10 items-center justify-center text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon name="chevrons-left" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={currentPage === 1}
                      title="Précédent"
                      aria-label="Aller à la page précédente"
                      className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon name="chevron-left" className="h-4 w-4" />
                    </button>
                    <div className="inline-flex min-w-24 items-center justify-center border-l border-stone-300 px-3 text-sm font-bold text-slate-700">
                      {currentPage} / {totalPages}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      disabled={currentPage === totalPages}
                      title="Suivant"
                      aria-label="Aller à la page suivante"
                      className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon name="chevron-right" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Fin"
                      aria-label="Aller à la dernière page"
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
        open={Boolean(confirmState)}
        title={confirmState?.title || ""}
        message={confirmState?.message || ""}
        confirmText={confirmState?.confirmText || "Confirmer"}
        loading={actionLoading}
        onCancel={() => (actionLoading ? undefined : setConfirmState(null))}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
