import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createUser, fetchUser, updateUser } from "../../../api/users";
import { useAuth } from "../../../hooks/admin/AuthContext";
import { useI18n } from "../../../hooks/admin/I18nContext";

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
  if (/^https?:\/\//i.test(path)) return path;
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
      return <svg {...common}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>;
    default:
      return null;
  }
}

export default function FormUserPage() {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(userId);
  const [form, setForm] = useState(initialForm);
  const [editedUser, setEditedUser] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isCurrentUser = isEditMode && currentUser?.id === editedUser?.id;

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
        if (!active) return;
        setEditedUser(user);
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
        if (!active) return;
        setError(requestError.response?.data?.message || t("users.form.load_error"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadUser();
    return () => {
      active = false;
    };
  }, [isEditMode, userId]);

  const previewUrl = useMemo(() => (form.avatar instanceof File ? URL.createObjectURL(form.avatar) : currentAvatar), [currentAvatar, form.avatar]);

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
      setForm((current) => ({ ...current, avatar: files?.[0] || null }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = isCurrentUser
        ? { ...form, role: undefined }
        : isEditMode
          ? { ...form, password: "", password_confirmation: "" }
          : form;
      if (isEditMode) await updateUser(userId, payload);
      else await createUser(form);
      navigate("/admin/users", { replace: true, state: { notice: isEditMode ? t("users.form.update_success") : t("users.form.create_success") } });
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || t("users.form.save_error"));
      } else {
        setError(requestError.response?.data?.message || t("users.form.save_error"));
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">{t("users.form.loading")}</div>;

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">{isEditMode ? t("users.form.edit_title") : t("users.form.create_title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("users.form.description")}</p>
          </div>
          <Link to="/admin/users" className="inline-flex items-center justify-center gap-2 self-start rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">
            <Icon name="arrow-left" className="h-4 w-4" />
            {t("users.common.back")}
          </Link>
        </div>
      </section>

      {error ? <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("users.form.fields.avatar")}</span>
                <div className="flex h-56 items-center justify-center overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
                  <img src={previewUrl} alt={form.pseudo || t("users.form.fields.avatar_alt")} className="h-full w-full object-cover" />
                </div>
                <input type="file" name="avatar" accept="image/png,image/jpeg,image/webp" onChange={handleChange} className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white" />
              </label>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("users.form.fields.pseudo")}</span>
                  <input type="text" name="pseudo" required value={form.pseudo} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder={t("users.form.fields.pseudo_placeholder")} />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("users.form.fields.email")}</span>
                  <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder={t("users.form.fields.email_placeholder")} />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("users.form.fields.contact")}</span>
                  <input type="text" name="contact" maxLength="10" value={form.contact} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder={t("users.form.fields.contact_placeholder")} />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("users.form.fields.address")}</span>
                  <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder={t("users.form.fields.address_placeholder")} />
                </label>
                {isCurrentUser ? (
                  <label className="space-y-2">
                    <span className="block text-sm font-bold text-slate-800">{t("users.form.fields.role")}</span>
                    <input type="text" value={t(`users.role.${form.role || "user"}`)} readOnly className="w-full rounded-sm border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-slate-500 outline-none" />
                  </label>
                ) : (
                  <label className="space-y-2">
                    <span className="block text-sm font-bold text-slate-800">{t("users.form.fields.role")}</span>
                    <select name="role" value={form.role} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400">
                      <option value="user">{t("users.role.user")}</option>
                      <option value="admin">{t("users.role.admin")}</option>
                    </select>
                  </label>
                )}
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("users.form.fields.status")}</span>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400">
                    <option value="active">{t("users.status.active")}</option>
                    <option value="inactive">{t("users.status.inactive")}</option>
                  </select>
                </label>
              </div>
            </div>

            {!isEditMode || isCurrentUser ? (
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{isEditMode ? t("users.form.fields.new_password") : t("users.form.fields.password")}</span>
                  <input type="password" name="password" required={!isEditMode} value={form.password} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder={t("users.form.fields.password_placeholder")} />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("users.form.fields.password_confirmation")}</span>
                  <input type="password" name="password_confirmation" required={!isEditMode || Boolean(form.password)} value={form.password_confirmation} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder={t("users.form.fields.password_confirmation_placeholder")} />
                </label>
              </div>
            ) : null}
          </div>

          <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link to="/admin/users" className="inline-flex w-full items-center justify-center rounded-sm border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition sm:w-auto">{t("users.common.cancel")}</Link>
              <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{saving ? t("users.common.saving") : isEditMode ? t("users.common.update") : t("users.common.save")}</button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
