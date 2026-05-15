import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUser, updateUser } from "../../../api/users";
import { useAuth } from "../../../hooks/admin/AuthContext";

function buildAvatarUrl(path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
}

function cn(...values) {
  return values.filter(Boolean).join(" ");
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
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

function InfoCard({ title, description, children, className = "" }) {
  return (
    <section className={cn("overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm", className)}>
      <div className="border-b border-stone-200 px-6 py-5">
        <h3 className="text-lg font-extrabold text-slate-950">{title}</h3>
        {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

const EMPTY_FORM = {
  pseudo: "",
  email: "",
  contact: "",
  address: "",
  password: "",
  password_confirmation: "",
  avatar: null,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm((current) => ({
      ...current,
      pseudo: user.pseudo ?? "",
      email: user.email ?? "",
      contact: user.contact ?? "",
      address: user.address ?? "",
      avatar: null,
    }));
  }, [user]);

  const currentAvatar = useMemo(() => buildAvatarUrl(user?.avatar), [user?.avatar]);
  const selectedAvatar = useMemo(() => (form.avatar instanceof File ? URL.createObjectURL(form.avatar) : null), [form.avatar]);

  useEffect(() => {
    return () => {
      if (selectedAvatar) {
        URL.revokeObjectURL(selectedAvatar);
      }
    };
  }, [selectedAvatar]);

  function handleChange(event) {
    const { name, value, files } = event.target;
    setNotice("");
    setError("");

    if (name === "avatar") {
      setForm((current) => ({
        ...current,
        avatar: files?.[0] ?? null,
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

    if (!user?.encrypted_id) {
      setError("Utilisateur introuvable.");
      return;
    }

    setSaving(true);
    setNotice("");
    setError("");

    try {
      await updateUser(user.encrypted_id, form);
      await refreshUser();
      setForm((current) => ({
        ...current,
        password: "",
        password_confirmation: "",
        avatar: null,
      }));
      setNotice("Informations du compte mises a jour.");
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;

      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || "Impossible de mettre a jour le compte.");
      } else {
        setError(requestError.response?.data?.message || "Impossible de mettre a jour le compte.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user?.encrypted_id) {
      setError("Utilisateur introuvable.");
      return;
    }

    setDeleteLoading(true);
    setError("");
    setNotice("");

    try {
      await deleteUser(user.encrypted_id);
      await logout();
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de supprimer le compte.");
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  }

  const previewAvatar = selectedAvatar || currentAvatar;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white/90">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-950">Settings</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Gerez votre compte administrateur, votre mot de passe et les informations globales de la plateforme.
            </p>
          </div>
        </div>
      </section>

      {notice ? (
        <div className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InfoCard
            title="Profil administrateur"
            description="Mettez a jour les informations du compte actuellement connecte."
          >
            <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-3">
                <span className="block text-sm font-bold text-slate-800">Avatar</span>
                <div className="flex h-44 items-center justify-center overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
                  {previewAvatar ? (
                    <img src={previewAvatar} alt={form.pseudo || "Avatar"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="px-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Aucun avatar
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  name="avatar"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleChange}
                  className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">Pseudo</span>
                  <input
                    type="text"
                    name="pseudo"
                    value={form.pseudo}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder="Votre pseudo"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder="Votre email"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">Contact</span>
                  <input
                    type="text"
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder="Numero de telephone"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="block text-sm font-bold text-slate-800">Adresse</span>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder="Adresse complete"
                  />
                </label>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="Mot de passe"
            description="Laissez les champs vides si vous ne souhaitez pas changer le mot de passe."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Nouveau mot de passe</span>
                <input
                  type="password"
                  name="password"
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
                  value={form.password_confirmation}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                  placeholder="Confirmer le mot de passe"
                />
              </label>
            </div>
          </InfoCard>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <InfoCard
            title="Plateforme"
            description="Apercu de l'identite actuelle. Le parametrage global pourra etre branche ici."
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
                <img src="/images/logo.png" alt="Logo plateforme" className="h-16 w-16 rounded-sm object-contain" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Titre</p>
                  <p className="mt-1 text-lg font-extrabold text-red-700">WORLD OF MADAGASCAR</p>
                </div>
              </div>
              <div className="rounded-sm border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-slate-500">
                Reglages du logo, du titre et des informations generales de la plateforme a connecter ici.
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="Categories"
            description="Espace prevu pour la gestion des categories et autres references admin."
          >
            <div className="rounded-sm border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-slate-500">
              Module categories a brancher prochainement depuis cette page.
            </div>
          </InfoCard>

          <InfoCard
            title="Zone sensible"
            description="Cette action supprime le compte actuellement connecte."
            className="border-rose-200"
          >
            <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-4">
              <p className="text-sm font-semibold text-rose-700">
                La suppression du compte est irreversible. Vous serez immediatement deconnecte.
              </p>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="mt-4 inline-flex items-center justify-center rounded-sm bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
              >
                Supprimer mon compte
              </button>
            </div>
          </InfoCard>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Supprimer le compte"
        message="Voulez-vous vraiment supprimer votre compte administrateur ?"
        confirmText="Oui, supprimer"
        loading={deleteLoading}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
