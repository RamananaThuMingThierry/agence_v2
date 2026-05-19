import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "../../../api/categories";
import { createPaymentMethod, deletePaymentMethod, fetchPaymentMethods, updatePaymentMethod } from "../../../api/paymentMethods";
import { fetchPlatformSettings, updatePlatformSettings } from "../../../api/platformSettings";
import { deleteAuthenticatedUser, updateUser } from "../../../api/users";
import { useAuth } from "../../../hooks/admin/AuthContext";
import { useI18n } from "../../../hooks/admin/I18nContext";
import { ActionButton } from "../../../components/admin/TableActions";

const EMPTY_FORM = {
  pseudo: "",
  email: "",
  contact: "",
  address: "",
  password: "",
  password_confirmation: "",
  avatar: null,
};

const EMPTY_PLATFORM_FORM = {
  platform_name: "",
  contact: "",
  email: "",
  address: "",
  logo: null,
};

const EMPTY_CATEGORY_FORM = {
  name: "",
  description: "",
  is_active: true,
};

const EMPTY_PAYMENT_METHOD_FORM = {
  name: "",
  code: "",
  image: null,
  is_active: true,
};

function buildAssetUrl(path, fallback = "/images/profil.png") {
  if (!path) return fallback;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
}

function cn(...values) {
  return values.filter(Boolean).join(" ");
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

function ConfirmDeleteModal({ open, password, loading, error, onChange, onCancel, onConfirm, t }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("settings.common.close")}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{t("settings.delete_account.modal.title")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {t("settings.delete_account.modal.description")}
          </p>
        </div>

        <label className="space-y-2">
          <span className="block text-sm font-bold text-slate-800">{t("settings.account.fields.password")}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
            placeholder={t("settings.delete_account.modal.password_placeholder")}
            disabled={loading}
          />
        </label>

        {error ? (
          <div className="mt-4 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
            disabled={loading}
          >
            {t("settings.common.cancel")}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading || !password}
          >
            {loading ? t("settings.common.deleting") : t("settings.delete_account.modal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmCategoryModal({ open, category, loading, onCancel, onConfirm, t }) {
  if (!open || !category) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("settings.common.close")}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{t("settings.categories.delete_modal.title")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {t("settings.categories.delete_modal.message", { name: category.name })}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
            disabled={loading}
          >
            {t("settings.common.cancel")}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t("settings.common.deleting") : t("settings.categories.delete_modal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmPaymentMethodModal({ open, paymentMethod, loading, onCancel, onConfirm, t }) {
  if (!open || !paymentMethod) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("settings.common.close")}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{t("settings.payment_methods.delete_modal.title")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {t("settings.payment_methods.delete_modal.message", { name: paymentMethod.name })}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
            disabled={loading}
          >
            {t("settings.common.cancel")}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t("settings.common.deleting") : t("settings.payment_methods.delete_modal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-sm border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
      <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("platform");
  const [form, setForm] = useState(EMPTY_FORM);
  const [platformForm, setPlatformForm] = useState(EMPTY_PLATFORM_FORM);
  const [platformCurrentLogo, setPlatformCurrentLogo] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [platformSaving, setPlatformSaving] = useState(false);
  const [platformLoading, setPlatformLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryDeleting, setCategoryDeleting] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmCategory, setConfirmCategory] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodLoading, setPaymentMethodLoading] = useState(false);
  const [paymentMethodSaving, setPaymentMethodSaving] = useState(false);
  const [paymentMethodDeleting, setPaymentMethodDeleting] = useState(false);
  const [paymentMethodSearch, setPaymentMethodSearch] = useState("");
  const [paymentMethodForm, setPaymentMethodForm] = useState(EMPTY_PAYMENT_METHOD_FORM);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [paymentMethodCurrentImage, setPaymentMethodCurrentImage] = useState("");
  const [confirmPaymentMethod, setConfirmPaymentMethod] = useState(null);
  const tabs = useMemo(
    () => [
      { id: "platform", label: t("settings.tabs.platform") },
      { id: "categories", label: t("settings.tabs.categories") },
      { id: "payment-methods", label: t("settings.tabs.payment_methods") },
      { id: "account", label: t("settings.tabs.account") },
    ],
    [t],
  );

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

  useEffect(() => {
    let active = true;

    async function loadPlatformData() {
      setPlatformLoading(true);

      try {
        const settings = await fetchPlatformSettings();

        if (!active) return;

        setPlatformForm({
          platform_name: settings?.platform_name ?? "WORLD OF MADAGASCAR",
          contact: settings?.contact ?? "",
          email: settings?.email ?? "",
          address: settings?.address ?? "",
          logo: null,
        });
        setPlatformCurrentLogo(buildAssetUrl(settings?.logo, "/images/logo.png"));
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || t("settings.platform.load_error"));
        }
      } finally {
        if (active) {
          setPlatformLoading(false);
        }
      }
    }

    loadPlatformData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "categories" || categories.length > 0) return;
    loadCategories();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "payment-methods" || paymentMethods.length > 0) return;
    loadPaymentMethods();
  }, [activeTab]);

  const currentAvatar = useMemo(() => buildAssetUrl(user?.avatar, "/images/profil.png"), [user?.avatar]);
  const selectedAvatar = useMemo(() => (form.avatar instanceof File ? URL.createObjectURL(form.avatar) : null), [form.avatar]);
  const selectedPlatformLogo = useMemo(() => (platformForm.logo instanceof File ? URL.createObjectURL(platformForm.logo) : null), [platformForm.logo]);
  const selectedPaymentMethodImage = useMemo(
    () => (paymentMethodForm.image instanceof File ? URL.createObjectURL(paymentMethodForm.image) : null),
    [paymentMethodForm.image],
  );

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      [category.name, category.description, category.is_active ? "active" : "inactive"]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [categories, categorySearch]);

  const categoryCounts = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((category) => Boolean(category.is_active)).length,
      inactive: categories.filter((category) => !category.is_active).length,
    }),
    [categories],
  );

  const filteredPaymentMethods = useMemo(() => {
    const query = paymentMethodSearch.trim().toLowerCase();

    if (!query) {
      return paymentMethods;
    }

    return paymentMethods.filter((paymentMethod) =>
      [paymentMethod.name, paymentMethod.code, paymentMethod.is_active ? "active" : "inactive"]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [paymentMethods, paymentMethodSearch]);

  const paymentMethodCounts = useMemo(
    () => ({
      total: paymentMethods.length,
      active: paymentMethods.filter((paymentMethod) => Boolean(paymentMethod.is_active)).length,
      inactive: paymentMethods.filter((paymentMethod) => !paymentMethod.is_active).length,
    }),
    [paymentMethods],
  );

  useEffect(() => {
    return () => {
      if (selectedAvatar) {
        URL.revokeObjectURL(selectedAvatar);
      }
    };
  }, [selectedAvatar]);

  useEffect(() => {
    return () => {
      if (selectedPlatformLogo) {
        URL.revokeObjectURL(selectedPlatformLogo);
      }
    };
  }, [selectedPlatformLogo]);

  useEffect(() => {
    return () => {
      if (selectedPaymentMethodImage) {
        URL.revokeObjectURL(selectedPaymentMethodImage);
      }
    };
  }, [selectedPaymentMethodImage]);

  function clearMessages() {
    setNotice("");
    setError("");
  }

  function resetCategoryForm() {
    setCategoryForm(EMPTY_CATEGORY_FORM);
    setEditingCategory(null);
  }

  function resetPaymentMethodForm() {
    setPaymentMethodForm(EMPTY_PAYMENT_METHOD_FORM);
    setEditingPaymentMethod(null);
    setPaymentMethodCurrentImage("");
  }

  async function loadCategories() {
    setCategoryLoading(true);
    setError("");

    try {
      const items = await fetchCategories();
      setCategories(items);
    } catch (requestError) {
      setCategories([]);
      setError(requestError.response?.data?.message || t("settings.categories.load_error"));
    } finally {
      setCategoryLoading(false);
    }
  }

  async function loadPaymentMethods() {
    setPaymentMethodLoading(true);
    setError("");

    try {
      const items = await fetchPaymentMethods();
      setPaymentMethods(items);
    } catch (requestError) {
      setPaymentMethods([]);
      setError(requestError.response?.data?.message || t("settings.payment_methods.load_error"));
    } finally {
      setPaymentMethodLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, files } = event.target;
    clearMessages();

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

  function handlePlatformChange(event) {
    const { name, value, files } = event.target;
    clearMessages();

    if (name === "logo") {
      setPlatformForm((current) => ({
        ...current,
        logo: files?.[0] ?? null,
      }));
      return;
    }

    setPlatformForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCategoryChange(event) {
    const { name, value, type, checked } = event.target;
    clearMessages();

    setCategoryForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handlePaymentMethodChange(event) {
    const { name, value, type, checked, files } = event.target;
    clearMessages();

    if (name === "image") {
      setPaymentMethodForm((current) => ({
        ...current,
        image: files?.[0] ?? null,
      }));
      return;
    }

    setPaymentMethodForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleEditCategory(category) {
    clearMessages();
    setEditingCategory(category);
    setCategoryForm({
      name: category?.name ?? "",
      description: category?.description ?? "",
      is_active: category?.is_active ?? true,
    });
  }

  function handleEditPaymentMethod(paymentMethod) {
    clearMessages();
    setEditingPaymentMethod(paymentMethod);
    setPaymentMethodForm({
      name: paymentMethod?.name ?? "",
      code: paymentMethod?.code ?? "",
      image: null,
      is_active: paymentMethod?.is_active ?? true,
    });
    setPaymentMethodCurrentImage(buildAssetUrl(paymentMethod?.image, "/images/logo.png"));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.encrypted_id) {
      setError(t("settings.account.messages.user_not_found"));
      return;
    }

    setSaving(true);
    clearMessages();

    try {
      await updateUser(user.encrypted_id, form);
      await refreshUser();
      setForm((current) => ({
        ...current,
        password: "",
        password_confirmation: "",
        avatar: null,
      }));
      setNotice(t("settings.account.messages.update_success"));
      setActiveTab("account");
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || t("settings.account.messages.update_error"));
      } else {
        setError(requestError.response?.data?.message || t("settings.account.messages.update_error"));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePlatformSubmit(event) {
    event.preventDefault();
    setPlatformSaving(true);
    clearMessages();

    try {
      const settings = await updatePlatformSettings(platformForm);
      setPlatformForm((current) => ({
        ...current,
        logo: null,
      }));
      setPlatformCurrentLogo(buildAssetUrl(settings?.logo, "/images/logo.png"));
      setNotice(t("settings.platform.messages.update_success"));
      setActiveTab("platform");
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || t("settings.platform.messages.update_error"));
      } else {
        setError(requestError.response?.data?.message || t("settings.platform.messages.update_error"));
      }
    } finally {
      setPlatformSaving(false);
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    setCategorySaving(true);
    clearMessages();

    try {
      if (editingCategory?.encrypted_id) {
        await updateCategory(editingCategory.encrypted_id, categoryForm);
        setNotice(t("settings.categories.messages.update_success"));
      } else {
        await createCategory(categoryForm);
        setNotice(t("settings.categories.messages.create_success"));
      }

      resetCategoryForm();
      await loadCategories();
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || t("settings.categories.messages.save_error"));
      } else {
        setError(requestError.response?.data?.message || t("settings.categories.messages.save_error"));
      }
    } finally {
      setCategorySaving(false);
    }
  }

  async function handleDeleteCategory() {
    if (!confirmCategory?.encrypted_id) return;

    setCategoryDeleting(true);
    clearMessages();

    try {
      await deleteCategory(confirmCategory.encrypted_id);
      setNotice(t("settings.categories.messages.delete_success"));
      if (editingCategory?.encrypted_id === confirmCategory.encrypted_id) {
        resetCategoryForm();
      }
      setConfirmCategory(null);
      await loadCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("settings.categories.messages.delete_error"));
    } finally {
      setCategoryDeleting(false);
    }
  }

  async function handlePaymentMethodSubmit(event) {
    event.preventDefault();
    setPaymentMethodSaving(true);
    clearMessages();

    try {
      if (editingPaymentMethod?.encrypted_id) {
        const updated = await updatePaymentMethod(editingPaymentMethod.encrypted_id, paymentMethodForm);
        setPaymentMethodCurrentImage(buildAssetUrl(updated?.image, "/images/logo.png"));
        setNotice(t("settings.payment_methods.messages.update_success"));
      } else {
        await createPaymentMethod(paymentMethodForm);
        setNotice(t("settings.payment_methods.messages.create_success"));
      }

      resetPaymentMethodForm();
      await loadPaymentMethods();
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || t("settings.payment_methods.messages.save_error"));
      } else {
        setError(requestError.response?.data?.message || t("settings.payment_methods.messages.save_error"));
      }
    } finally {
      setPaymentMethodSaving(false);
    }
  }

  async function handleDeletePaymentMethod() {
    if (!confirmPaymentMethod?.encrypted_id) return;

    setPaymentMethodDeleting(true);
    clearMessages();

    try {
      await deletePaymentMethod(confirmPaymentMethod.encrypted_id);
      setNotice(t("settings.payment_methods.messages.delete_success"));
      if (editingPaymentMethod?.encrypted_id === confirmPaymentMethod.encrypted_id) {
        resetPaymentMethodForm();
      }
      setConfirmPaymentMethod(null);
      await loadPaymentMethods();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("settings.payment_methods.messages.delete_error"));
    } finally {
      setPaymentMethodDeleting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteError("");
    setError("");
    setNotice("");

    try {
      await deleteAuthenticatedUser(deletePassword);
      await logout();
      navigate("/login", { replace: true });
    } catch (requestError) {
      setDeleteError(requestError.response?.data?.message || t("settings.delete_account.messages.delete_error"));
    } finally {
      setDeleteLoading(false);
    }
  }

  function openDeleteModal() {
    setDeletePassword("");
    setDeleteError("");
    setDeleteOpen(true);
  }

  function closeDeleteModal() {
    if (deleteLoading) return;
    setDeleteOpen(false);
    setDeletePassword("");
    setDeleteError("");
  }

  const previewAvatar = selectedAvatar || currentAvatar;
  const previewPlatformLogo = selectedPlatformLogo || platformCurrentLogo || "/images/logo.png";
  const previewPaymentMethodImage = selectedPaymentMethodImage || paymentMethodCurrentImage || "/images/logo.png";
  const rawUserStatusKey = user?.status ? `settings.status.${user.status}` : "settings.status.active";
  const translatedUserStatus = t(rawUserStatusKey);
  const userStatusLabel = user?.status && translatedUserStatus === rawUserStatusKey ? user.status : translatedUserStatus;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white/90">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-950">{t("settings.title")}</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              {t("settings.description")}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 rounded-sm border border-stone-200 bg-white p-3 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-sm px-4 py-3 text-sm font-bold transition",
              activeTab === tab.id
                ? "bg-red-600 text-white"
                : "border border-stone-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {notice ? <div className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</div> : null}
      {error ? <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      {activeTab === "platform" ? (
        <form onSubmit={handlePlatformSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
            <InfoCard
            title={t("settings.platform.title")}
            description={t("settings.platform.description")}
          >
            <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-3">
                <span className="block text-sm font-bold text-slate-800">{t("settings.platform.fields.logo")}</span>
                <div className="flex h-44 items-center justify-center overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
                  <img src={previewPlatformLogo} alt={platformForm.platform_name || t("settings.platform.preview.logo_alt")} className="h-full w-full object-cover" />
                </div>
                <input
                  type="file"
                  name="logo"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePlatformChange}
                  className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="block text-sm font-bold text-slate-800">{t("settings.platform.fields.platform_name")}</span>
                  <input
                    type="text"
                    name="platform_name"
                    value={platformForm.platform_name}
                    onChange={handlePlatformChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder={t("settings.platform.fields.platform_name_placeholder")}
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("settings.platform.fields.contact")}</span>
                  <input
                    type="text"
                    name="contact"
                    value={platformForm.contact}
                    onChange={handlePlatformChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder={t("settings.platform.fields.contact_placeholder")}
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("settings.platform.fields.email")}</span>
                  <input
                    type="email"
                    name="email"
                    value={platformForm.email}
                    onChange={handlePlatformChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder={t("settings.platform.fields.email_placeholder")}
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="block text-sm font-bold text-slate-800">{t("settings.platform.fields.address")}</span>
                  <input
                    type="text"
                    name="address"
                    value={platformForm.address}
                    onChange={handlePlatformChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder={t("settings.platform.fields.address_placeholder")}
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={platformSaving || platformLoading}
                className="inline-flex items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {platformSaving ? t("settings.common.saving") : t("settings.platform.save")}
              </button>
            </div>
          </InfoCard>

          <InfoCard
            title={t("settings.platform.preview.title")}
            description={t("settings.platform.preview.description")}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
                <img src={previewPlatformLogo} alt={t("settings.platform.preview.logo_alt")} className="h-16 w-16 rounded-sm object-contain" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.platform.preview.platform")}</p>
                  <p className="mt-1 text-lg font-extrabold text-red-700">{platformForm.platform_name || "WORLD OF MADAGASCAR"}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.platform.fields.contact")}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{platformForm.contact || "-"}</p>
                </div>
                <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.platform.fields.email")}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{platformForm.email || "-"}</p>
                </div>
                <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3 md:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.platform.fields.address")}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{platformForm.address || "-"}</p>
                </div>
              </div>
            </div>
          </InfoCard>
        </form>
      ) : null}

      {activeTab === "categories" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <InfoCard
              title={t("settings.categories.title")}
              description={t("settings.categories.description")}
            >
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.categories.stats.total")}</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-950">{categoryCounts.total}</p>
                  </div>
                  <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.categories.stats.active")}</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-950">{categoryCounts.active}</p>
                  </div>
                  <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.categories.stats.inactive")}</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-950">{categoryCounts.inactive}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <input
                    type="search"
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    placeholder={t("settings.categories.search_placeholder")}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition lg:max-w-sm"
                  />
                  <button
                    type="button"
                    onClick={loadCategories}
                    disabled={categoryLoading}
                    className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {categoryLoading ? t("settings.common.loading") : t("settings.common.refresh")}
                  </button>
                </div>

                {categoryLoading ? (
                  <EmptyState title={t("settings.common.loading")} description={t("settings.categories.loading_description")} />
                ) : filteredCategories.length === 0 ? (
                  <EmptyState title={t("settings.categories.empty_title")} description={t("settings.categories.empty_description")} />
                ) : (
                  <div className="overflow-hidden rounded-sm border border-stone-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-stone-200">
                        <thead className="bg-stone-50 text-left">
                          <tr>
                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.categories.table.name")}</th>
                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.categories.table.description")}</th>
                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.categories.table.status")}</th>
                            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.categories.table.actions")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 bg-white">
                          {filteredCategories.map((category) => (
                            <tr key={category.encrypted_id || category.id} className="align-top">
                              <td className="px-5 py-4 text-sm font-bold text-slate-900">{category.name}</td>
                              <td className="px-5 py-4 text-sm text-slate-600">{category.description || t("settings.categories.table.no_description")}</td>
                              <td className="px-5 py-4">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]",
                                    category.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
                                  )}
                                >
                                  {category.is_active ? t("settings.status.active") : t("settings.status.inactive")}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <ActionButton onClick={() => handleEditCategory(category)} title={t("settings.common.edit")} icon="edit" tone="dark" />
                                  <ActionButton onClick={() => setConfirmCategory(category)} title={t("settings.common.delete")} icon="delete" tone="danger" />
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
            </InfoCard>

            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <InfoCard
                title={editingCategory ? t("settings.categories.form.edit_title") : t("settings.categories.form.create_title")}
                description={t("settings.categories.form.description")}
              >
                <div className="space-y-6">
                  <label className="space-y-2">
                    <span className="block text-sm font-bold text-slate-800">{t("settings.categories.form.fields.name")}</span>
                    <input
                      type="text"
                      name="name"
                      required
                      value={categoryForm.name}
                      onChange={handleCategoryChange}
                      className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                      placeholder={t("settings.categories.form.fields.name_placeholder")}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="block text-sm font-bold text-slate-800">{t("settings.categories.form.fields.description")}</span>
                    <textarea
                      name="description"
                      rows="6"
                      value={categoryForm.description}
                      onChange={handleCategoryChange}
                      className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                      placeholder={t("settings.categories.form.fields.description_placeholder")}
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={categoryForm.is_active}
                      onChange={handleCategoryChange}
                      className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="block text-sm font-bold text-slate-800">{t("settings.categories.form.fields.active")}</span>
                      <span className="block text-xs text-slate-500">{t("settings.categories.form.fields.active_help")}</span>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  {editingCategory ? (
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-stone-50"
                    >
                      {t("settings.common.cancel")}
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={categorySaving}
                    className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {categorySaving ? t("settings.common.saving") : editingCategory ? t("settings.common.update") : t("settings.common.save")}
                  </button>
                </div>
              </InfoCard>
            </form>

        </div>
      ) : null}

      {activeTab === "payment-methods" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <InfoCard
            title={t("settings.payment_methods.title")}
            description={t("settings.payment_methods.description")}
          >
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.payment_methods.stats.total")}</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-950">{paymentMethodCounts.total}</p>
                </div>
                <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.payment_methods.stats.active")}</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-950">{paymentMethodCounts.active}</p>
                </div>
                <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.payment_methods.stats.inactive")}</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-950">{paymentMethodCounts.inactive}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <input
                  type="search"
                  value={paymentMethodSearch}
                  onChange={(event) => setPaymentMethodSearch(event.target.value)}
                  placeholder={t("settings.payment_methods.search_placeholder")}
                  className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition lg:max-w-sm"
                />
                <button
                  type="button"
                  onClick={loadPaymentMethods}
                  disabled={paymentMethodLoading}
                  className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentMethodLoading ? t("settings.common.loading") : t("settings.common.refresh")}
                </button>
              </div>

              {paymentMethodLoading ? (
                <EmptyState title={t("settings.common.loading")} description={t("settings.payment_methods.loading_description")} />
              ) : filteredPaymentMethods.length === 0 ? (
                <EmptyState title={t("settings.payment_methods.empty_title")} description={t("settings.payment_methods.empty_description")} />
              ) : (
                <div className="overflow-hidden rounded-sm border border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-stone-50 text-left">
                        <tr>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.payment_methods.table.name")}</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.payment_methods.table.code")}</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.payment_methods.table.status")}</th>
                          <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.payment_methods.table.actions")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white">
                        {filteredPaymentMethods.map((paymentMethod) => (
                          <tr key={paymentMethod.encrypted_id || paymentMethod.id} className="align-top">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
                                  <img src={buildAssetUrl(paymentMethod.image, "/images/logo.png")} alt={paymentMethod.name} className="h-full w-full object-contain" />
                                </div>
                                <p className="text-sm font-bold text-slate-900">{paymentMethod.name}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">{paymentMethod.code}</td>
                            <td className="px-5 py-4">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]",
                                  paymentMethod.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
                                )}
                              >
                                {paymentMethod.is_active ? t("settings.status.active") : t("settings.status.inactive")}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap justify-end gap-2">
                                <ActionButton onClick={() => handleEditPaymentMethod(paymentMethod)} title={t("settings.common.edit")} icon="edit" tone="dark" />
                                <ActionButton onClick={() => setConfirmPaymentMethod(paymentMethod)} title={t("settings.common.delete")} icon="delete" tone="danger" />
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
          </InfoCard>

          <form onSubmit={handlePaymentMethodSubmit} className="space-y-6">
            <InfoCard
              title={editingPaymentMethod ? t("settings.payment_methods.form.edit_title") : t("settings.payment_methods.form.create_title")}
              description={t("settings.payment_methods.form.description")}
            >
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="space-y-3">
                    <span className="block text-sm font-bold text-slate-800">{t("settings.payment_methods.form.fields.logo")}</span>
                    <div className="flex h-28 items-center justify-center overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
                      <img src={previewPaymentMethodImage} alt={paymentMethodForm.name || t("settings.payment_methods.form.logo_alt")} className="h-full w-full object-contain" />
                    </div>
                    <input
                      type="file"
                      name="image"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handlePaymentMethodChange}
                      className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white"
                    />
                  </div>

                  <div className="space-y-6">
                    <label className="space-y-2">
                      <span className="block text-sm font-bold text-slate-800">{t("settings.payment_methods.form.fields.name")}</span>
                      <input
                        type="text"
                        name="name"
                        required
                        value={paymentMethodForm.name}
                        onChange={handlePaymentMethodChange}
                        className="w-full mb-2 rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                        placeholder={t("settings.payment_methods.form.fields.name_placeholder")}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="block text-sm font-bold text-slate-800">{t("settings.payment_methods.form.fields.code")}</span>
                      <input
                        type="text"
                        name="code"
                        required
                        value={paymentMethodForm.code}
                        onChange={handlePaymentMethodChange}
                        className="w-full mb-2 rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                        placeholder={t("settings.payment_methods.form.fields.code_placeholder")}
                      />
                    </label>

                    <label className="mt-2 flex items-center gap-3 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={paymentMethodForm.is_active}
                        onChange={handlePaymentMethodChange}
                        className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <span className="block text-sm font-bold text-slate-800">{t("settings.payment_methods.form.fields.active")}</span>
                        <span className="block text-xs text-slate-500">{t("settings.payment_methods.form.fields.active_help")}</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                {editingPaymentMethod ? (
                  <button
                    type="button"
                    onClick={resetPaymentMethodForm}
                    className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-stone-50"
                  >
                    {t("settings.common.cancel")}
                  </button>
                ) : null}
                <button
                  type="submit"
                  disabled={paymentMethodSaving}
                  className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentMethodSaving ? t("settings.common.saving") : editingPaymentMethod ? t("settings.common.update") : t("settings.common.save")}
                </button>
              </div>
            </InfoCard>
          </form>
        </div>
      ) : null}

      {activeTab === "account" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InfoCard
              title={t("settings.account.title")}
              description={t("settings.account.description")}
            >
              <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="space-y-3">
                  <span className="block text-sm font-bold text-slate-800">{t("settings.account.fields.avatar")}</span>
                  <div className="flex h-44 items-center justify-center overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
                    <img src={previewAvatar} alt={form.pseudo || t("settings.account.fields.avatar")} className="h-full w-full object-cover" />
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
                    <span className="block text-sm font-bold text-slate-800">{t("settings.account.fields.pseudo")}</span>
                    <input
                      type="text"
                      name="pseudo"
                      value={form.pseudo}
                      onChange={handleChange}
                      className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                      placeholder={t("settings.account.fields.pseudo_placeholder")}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="block text-sm font-bold text-slate-800">{t("settings.account.fields.email")}</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                      placeholder={t("settings.account.fields.email_placeholder")}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="block text-sm font-bold text-slate-800">{t("settings.account.fields.contact")}</span>
                    <input
                      type="text"
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                      placeholder={t("settings.account.fields.contact_placeholder")}
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="block text-sm font-bold text-slate-800">{t("settings.account.fields.address")}</span>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                      placeholder={t("settings.account.fields.address_placeholder")}
                    />
                  </label>
                </div>
              </div>
            </InfoCard>

            <InfoCard
              title={t("settings.account.password_section.title")}
              description={t("settings.account.password_section.description")}
            >
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("settings.account.fields.new_password")}</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder={t("settings.account.fields.new_password_placeholder")}
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("settings.account.fields.password_confirmation")}</span>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                    placeholder={t("settings.account.fields.password_confirmation_placeholder")}
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
                {saving ? t("settings.common.saving") : t("settings.account.save")}
              </button>
            </div>
          </form>

          <div className="space-y-6">
            <InfoCard
              title={t("settings.account.session.title")}
              description={t("settings.account.session.description")}
            >
              <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.account.session.role")}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{user?.role || "admin"}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("settings.account.session.status")}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{userStatusLabel}</p>
              </div>
            </InfoCard>

            <InfoCard
              title={t("settings.delete_account.title")}
              description={t("settings.delete_account.description")}
              className="border-rose-200"
            >
              <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-4">
                <p className="text-sm font-semibold text-rose-700">
                  {t("settings.delete_account.warning")}
                </p>
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="mt-4 inline-flex items-center justify-center rounded-sm bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
                >
                  {t("settings.delete_account.button")}
                </button>
              </div>
            </InfoCard>
          </div>
        </div>
      ) : null}

      <ConfirmDeleteModal
        open={deleteOpen}
        password={deletePassword}
        loading={deleteLoading}
        error={deleteError}
        onChange={setDeletePassword}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteAccount}
        t={t}
      />

      <ConfirmCategoryModal
        open={Boolean(confirmCategory)}
        category={confirmCategory}
        loading={categoryDeleting}
        onCancel={() => (categoryDeleting ? undefined : setConfirmCategory(null))}
        onConfirm={handleDeleteCategory}
        t={t}
      />

      <ConfirmPaymentMethodModal
        open={Boolean(confirmPaymentMethod)}
        paymentMethod={confirmPaymentMethod}
        loading={paymentMethodDeleting}
        onCancel={() => (paymentMethodDeleting ? undefined : setConfirmPaymentMethod(null))}
        onConfirm={handleDeletePaymentMethod}
        t={t}
      />
    </div>
  );
}
