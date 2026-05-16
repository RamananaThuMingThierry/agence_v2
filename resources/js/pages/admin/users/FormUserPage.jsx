import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createUser, fetchUser, updateUser } from "../../../api/users";

const DEFAULT_AVATAR = "/images/profil.png";

const initialForm = {
  pseudo: "",
  email: "",
  contact: "",
  address: "",
  role: "user",
  status: "active",
  password: "",
  password_confirmation: "",
  avatar: null,
};

function buildAvatarUrl(path) {
  if (!path) return DEFAULT_AVATAR;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
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
    case "arrow-left":
      return (
        <svg {...common}>
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function FormUserPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(userId);
  const [form, setForm] = useState(initialForm);
  const [currentAvatar, setCurrentAvatar] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const user = await fetchUser(userId);

        if (!active) {
          return;
        }

        setForm({
          pseudo: user?.pseudo || "",
          email: user?.email || "",
          contact: user?.contact || "",
          address: user?.address || "",
          role: user?.role || "user",
          status: user?.status || "active",
          password: "",
          password_confirmation: "",
          avatar: null,
        });
        setCurrentAvatar(buildAvatarUrl(user?.avatar));
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(requestError.response?.data?.message || "Impossible de charger le user.");
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
  }, [isEditMode, userId]);

  const previewUrl = useMemo(() => {
    if (form.avatar instanceof File) {
      return URL.createObjectURL(form.avatar);
    }

    return currentAvatar;
  }, [currentAvatar, form.avatar]);

  useEffect(() => {
    return () => {
      if (previewUrl && form.avatar instanceof File) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [form.avatar, previewUrl]);

  function handleChange(event) {
    const { name, value, files } = event.target;

    if (name === "avatar") {
      setForm((current) => ({
        ...current,
        avatar: files?.[0] || null,
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEditMode) {
        await updateUser(userId, form);
      } else {
        await createUser(form);
      }

      navigate("/admin/users", {
        replace: true,
        state: {
          notice: isEditMode ? "User mis a jour." : "User cree.",
        },
      });
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;

      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || "Echec de l'enregistrement du user.");
      } else {
        setError(requestError.response?.data?.message || "Echec de l'enregistrement du user.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">
        Chargement du user...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
              {isEditMode ? "Modifier le user" : "Ajouter un user"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Renseignez le profil, le role, le statut et le mot de passe initial.
            </p>
          </div>

          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center gap-2 self-start rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            Retour a la liste
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Avatar</span>
                <div className="flex h-56 items-center justify-center overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
                  <img src={previewUrl} alt={form.pseudo || "Avatar"} className="h-full w-full object-cover" />
                </div>
                <input
                  type="file"
                  name="avatar"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleChange}
                  className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white"
                />
              </label>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">Pseudo</span>
                  <input
                    type="text"
                    name="pseudo"
                    required
                    value={form.pseudo}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder="Pseudo utilisateur"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder="email@domaine.com"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">Contact</span>
                  <input
                    type="text"
                    name="contact"
                    maxLength="10"
                    value={form.contact}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder="Telephone"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">Adresse</span>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder="Adresse"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">Role</span>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">Statut</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">
                  {isEditMode ? "Nouveau mot de passe" : "Mot de passe"}
                </span>
                <input
                  type="password"
                  name="password"
                  required={!isEditMode}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                  placeholder="Minimum 8 caracteres"
                />
              </label>

              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Confirmation</span>
                <input
                  type="password"
                  name="password_confirmation"
                  required={!isEditMode || Boolean(form.password)}
                  value={form.password_confirmation}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                  placeholder="Confirmer le mot de passe"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/admin/users"
                className="inline-flex w-full items-center justify-center rounded-sm border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition sm:w-auto"
              >
                Annuler
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Enregistrement..." : isEditMode ? "Mettre a jour" : "Enregistrer"}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
