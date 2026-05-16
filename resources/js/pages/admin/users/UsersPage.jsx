import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/admin/AuthContext";
import { deleteUser, fetchUsers, forceDeleteUser, restoreUser } from "../../../api/users";

const DEFAULT_AVATAR = "/images/profil.png";

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

function buildAvatarUrl(path) {
  if (!path) return DEFAULT_AVATAR;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
}

function Icon({ name, className = "h-4 w-4" }) {
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
    case "details":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
        </svg>
      );
    case "delete":
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>
      );
    case "restore":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 3v6h6" />
        </svg>
      );
    case "force":
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M6 6l1 14h10l1-14" />
          <path d="m9 10 6 6" />
          <path d="m15 10-6 6" />
        </svg>
      );
    case "sort":
      return (
        <svg {...common}>
          <path d="m8 7 4-4 4 4" />
          <path d="M12 3v18" />
          <path d="m16 17-4 4-4-4" />
        </svg>
      );
    case "sort-asc":
      return (
        <svg {...common}>
          <path d="m8 9 4-4 4 4" />
          <path d="M12 5v14" />
        </svg>
      );
    case "sort-desc":
      return (
        <svg {...common}>
          <path d="m8 15 4 4 4-4" />
          <path d="M12 5v14" />
        </svg>
      );
    default:
      return null;
  }
}

function ActionLink({ to, title, icon, tone = "default" }) {
  const tones = {
    default: "border-stone-300 text-slate-700 hover:bg-stone-100",
    dark: "border-stone-300 text-slate-700 hover:bg-black hover:text-white",
  };

  return (
    <Link
      to={to}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-sm border transition",
        tones[tone] || tones.default,
      )}
    >
      <Icon name={icon} />
    </Link>
  );
}

function ActionButton({ onClick, title, icon, tone = "default" }) {
  const tones = {
    default: "border-stone-300 text-slate-700 hover:bg-stone-100",
    danger: "border-rose-200 text-rose-700 hover:bg-red-600 hover:text-white",
    warning: "border-red-200 text-red-700 hover:bg-red-50",
    subtleDanger: "border-rose-200 text-rose-700 hover:bg-rose-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-sm border transition",
        tones[tone] || tones.default,
      )}
    >
      <Icon name={icon} />
    </button>
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

function StatBadge({ tone, children }) {
  const tones = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-sky-100 text-sky-700",
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]", tones[tone] || tones.slate)}>
      {children}
    </span>
  );
}

function SortableHead({ label, column, sortBy, sortDirection, onSort }) {
  const active = sortBy === column;
  const iconName = !active ? "sort" : sortDirection === "asc" ? "sort-asc" : "sort-desc";

  return (
    <th className="px-5 py-4">
      <button
        type="button"
        onClick={() => onSort(column)}
        title={`Trier par ${label}`}
        className={cn(
          "inline-flex items-center gap-2 font-bold uppercase tracking-[0.18em] transition",
          active ? "text-slate-800" : "text-slate-500 hover:text-slate-700",
        )}
      >
        <span>{label}</span>
        <span className={cn("inline-flex", active ? "text-red-700" : "text-slate-400")}>
          <Icon name={iconName} className="h-4 w-4" />
        </span>
      </button>
    </th>
  );
}

export default function UsersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
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
    loadUsers();
  }, []);

  useEffect(() => {
    if (!location.state?.notice) {
      return;
    }

    setNotice(location.state.notice);
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    setPage(1);
  }, [filter, search, pageSize, sortBy, sortDirection]);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const items = await fetchUsers({ with_trashed: true });
      setUsers(items);
    } catch (requestError) {
      setUsers([]);
      setError(requestError.response?.data?.message || "Impossible de charger les users.");
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

  function openConfirm(action, user) {
    const config = {
      delete: {
        title: "Supprimer le user",
        message: `Voulez-vous envoyer "${user.pseudo}" dans la corbeille ?`,
        confirmText: "Oui, supprimer",
      },
      restore: {
        title: "Restaurer le user",
        message: `Voulez-vous restaurer "${user.pseudo}" ?`,
        confirmText: "Oui, restaurer",
      },
      force: {
        title: "Suppression definitive",
        message: `Voulez-vous supprimer definitivement "${user.pseudo}" ?`,
        confirmText: "Oui, supprimer",
      },
    };

    setConfirmState({ action, user, ...config[action] });
  }

  async function handleDelete(user) {
    try {
      await deleteUser(user.encrypted_id);
      setNotice("User deplace dans la corbeille.");
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Echec de la suppression du user.");
    }
  }

  async function handleRestore(user) {
    try {
      await restoreUser(user.encrypted_id);
      setNotice("User restaure.");
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Echec de la restauration du user.");
    }
  }

  async function handleForceDelete(user) {
    try {
      await forceDeleteUser(user.encrypted_id);
      setNotice("User supprime definitivement.");
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Echec de la suppression definitive du user.");
    }
  }

  async function handleConfirmAction() {
    if (!confirmState) return;

    setActionLoading(true);

    try {
      if (confirmState.action === "delete") {
        await handleDelete(confirmState.user);
      } else if (confirmState.action === "restore") {
        await handleRestore(confirmState.user);
      } else if (confirmState.action === "force") {
        await handleForceDelete(confirmState.user);
      }

      setConfirmState(null);
    } finally {
      setActionLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const baseUsers = users.filter((user) => {
      if (filter === "trashed") {
        return Boolean(user.deleted_at);
      }

      if (filter === "inactive") {
        return !user.deleted_at && user.status === "inactive";
      }

      if (filter === "admins") {
        return !user.deleted_at && user.role === "admin";
      }

      if (filter === "all") {
        return !user.deleted_at;
      }

      return !user.deleted_at && user.status === "active";
    });

    if (!query) {
      return baseUsers;
    }

    return baseUsers.filter((user) =>
      [user.pseudo, user.email, user.contact, user.address, user.role, user.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [filter, search, users]);

  const sortedUsers = useMemo(() => {
    const items = [...filteredUsers];

    items.sort((left, right) => {
      const leftValue =
        sortBy === "status"
          ? `${left.deleted_at ? "trashed" : left.status || ""}-${left.role || ""}`
          : sortBy === "role"
            ? String(left.role || "").toLowerCase()
            : sortBy === "created_at"
              ? new Date(left.created_at || 0).getTime()
              : String(left[sortBy] || "").toLowerCase();

      const rightValue =
        sortBy === "status"
          ? `${right.deleted_at ? "trashed" : right.status || ""}-${right.role || ""}`
          : sortBy === "role"
            ? String(right.role || "").toLowerCase()
            : sortBy === "created_at"
              ? new Date(right.created_at || 0).getTime()
              : String(right[sortBy] || "").toLowerCase();

      if (leftValue < rightValue) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

    return items;
  }, [filteredUsers, sortBy, sortDirection]);

  const counts = useMemo(
    () => ({
      active: users.filter((user) => !user.deleted_at && user.status === "active").length,
      admins: users.filter((user) => !user.deleted_at && user.role === "admin").length,
      trashed: users.filter((user) => Boolean(user.deleted_at)).length,
      total: users.length,
    }),
    [users],
  );

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedUsers]);

  return (
    <div className="space-y-2">
      <section className="overflow-hidden rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Gestion des users</h2>
            <p className="mt-2 text-sm text-slate-500">
              Liste, recherche, tri, roles, statuts et cycle de vie complet des utilisateurs.
            </p>
          </div>

          <Link
            to="/admin/users/create"
            className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Nouveau user
          </Link>
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Actifs</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.active}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Admins</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.admins}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Corbeille</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.trashed}</p>
          </div>
          <div className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">{counts.total}</p>
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
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="admins">Admins</option>
                <option value="trashed">Corbeille</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un user..."
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
                onClick={loadUsers}
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
              <EmptyState title="Chargement..." description="Les users sont en cours de recuperation depuis l'API." />
            ) : sortedUsers.length === 0 ? (
              <EmptyState
                title="Aucun user trouve"
                description="Ajustez les filtres ou creez un nouvel utilisateur depuis le bouton en haut a droite."
              />
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-sm border border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-light text-left text-xs uppercase tracking-[0.18em]">
                        <tr>
                          <th className="px-5 py-4 text-slate-500">Profil</th>
                          <SortableHead label="Email" column="email" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label="Role" column="role" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label="Statut" column="status" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <SortableHead label="Creation" column="created_at" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                          <th className="px-5 py-4 text-right text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white">
                        {paginatedUsers.map((user) => {
                          const isCurrentUser = currentUser?.id === user.id;

                          return (
                          <tr key={user.encrypted_id || user.id} className="align-top">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-stone-100">
                                  <img src={buildAvatarUrl(user.avatar)} alt={user.pseudo} className="h-full w-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-slate-950">{user.pseudo}</p>
                                  <p className="mt-1 text-sm text-slate-500">{user.contact || "Aucun contact"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              <p>{user.email}</p>
                              <p className="mt-1 text-xs text-slate-400">{user.address || "Sans adresse"}</p>
                            </td>
                            <td className="px-5 py-4">
                              <StatBadge tone={user.role === "admin" ? "blue" : "slate"}>{user.role || "user"}</StatBadge>
                            </td>
                            <td className="px-5 py-4">
                              {user.deleted_at ? (
                                <StatBadge tone="red">Corbeille</StatBadge>
                              ) : (
                                <StatBadge tone={user.status === "active" ? "green" : "amber"}>{user.status || "inactive"}</StatBadge>
                              )}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR") : "-"}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap justify-end gap-2">
                                <ActionLink to={`/admin/users/${user.encrypted_id}`} title="Details" icon="details" />
                                {!user.deleted_at ? (
                                  <>
                                    <ActionLink to={`/admin/users/${user.encrypted_id}/edit`} title="Modifier" icon="edit" tone="dark" />
                                    {!isCurrentUser ? (
                                      <ActionButton onClick={() => openConfirm("delete", user)} title="Supprimer" icon="delete" tone="danger" />
                                    ) : null}
                                  </>
                                ) : (
                                  <>
                                    <ActionButton onClick={() => openConfirm("restore", user)} title="Restaurer" icon="restore" tone="warning" />
                                    {!isCurrentUser ? (
                                      <ActionButton onClick={() => openConfirm("force", user)} title="Suppression definitive" icon="force" tone="subtleDanger" />
                                    ) : null}
                                  </>
                                )}
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
                  <p className="text-sm text-slate-500">
                    Page <span className="font-bold text-slate-800">{currentPage}</span> sur{" "}
                    <span className="font-bold text-slate-800">{totalPages}</span>
                  </p>

                  <div className="inline-flex overflow-hidden rounded-sm border border-stone-300 bg-white">
                    <button
                      type="button"
                      onClick={() => setPage(1)}
                      disabled={currentPage === 1}
                      className="inline-flex h-10 w-10 items-center justify-center text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {"<<"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {"<"}
                    </button>
                    <div className="inline-flex min-w-24 items-center justify-center border-l border-stone-300 px-3 text-sm font-bold text-slate-700">
                      {currentPage} / {totalPages}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {">"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="inline-flex h-10 w-10 items-center justify-center border-l border-stone-300 text-slate-700 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {">>"}
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




