import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchUser } from "../../../api/users";

const DEFAULT_AVATAR = "/images/profil.png";

function buildAvatarUrl(path) {
  if (!path) return DEFAULT_AVATAR;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}

function StatusBadge({ value, deletedAt }) {
  if (deletedAt) {
    return <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-700">Corbeille</span>;
  }

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${value === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
      {value || "inactive"}
    </span>
  );
}

export default function UserDetailsPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchUser(userId);

        if (!active) {
          return;
        }

        setUser(data);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(requestError.response?.data?.message || "Impossible de charger les details du user.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">Chargement du user...</div>;
  }

  if (error) {
    return <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Details du user</h2>
            <p className="mt-2 text-sm text-slate-500">Consultation rapide du profil utilisateur.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black"
            >
              Retour a la liste
            </Link>
            <Link
              to={`/admin/users/${user?.encrypted_id}/edit`}
              className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Modifier
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
        <div className="grid gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
              <img src={buildAvatarUrl(user?.avatar)} alt={user?.pseudo || "Profil"} className="h-72 w-72 object-center" />
            </div>
            <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4 text-center">
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${user?.role === "admin" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700"}`}>
                  {user?.role || "user"}
                </span>
                <StatusBadge value={user?.status} deletedAt={user?.deleted_at} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard label="Pseudo" value={user?.pseudo} />
            <DetailCard label="Email" value={user?.email} />
            <DetailCard label="Contact" value={user?.contact} />
            <DetailCard label="Adresse" value={user?.address} />
            <DetailCard label="Role" value={user?.role} />
            <DetailCard label="Statut" value={user?.deleted_at ? "corbeille" : user?.status} />
            <DetailCard label="Creation" value={user?.created_at ? new Date(user.created_at).toLocaleString("fr-FR") : "-"} />
            <DetailCard label="Derniere mise a jour" value={user?.updated_at ? new Date(user.updated_at).toLocaleString("fr-FR") : "-"} />
          </div>
        </div>
      </section>
    </div>
  );
}
