import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createSlide, fetchSlide, updateSlide } from "../../../api/slides";
import { useI18n } from "../../../hooks/admin/I18nContext";

const initialForm = {
  title: "",
  subtitle: "",
  description: "",
  order: 0,
  is_active: true,
  image: null,
};

function buildImageUrl(path) {
  if (!path) return null;
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

export default function FormSlidePage() {
  const { t } = useI18n();
  const { slideId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(slideId);
  const [form, setForm] = useState(initialForm);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadSlide() {
      if (!isEditMode) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const slide = await fetchSlide(slideId);
        if (!active) return;
        setForm({
          title: slide?.title || "",
          subtitle: slide?.subtitle || "",
          description: slide?.description || "",
          order: slide?.order ?? 0,
          is_active: slide?.is_active ?? true,
          image: null,
        });
        setCurrentImage(slide?.image ? buildImageUrl(slide.image) : "");
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || t("slides.form.load_error"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSlide();
    return () => {
      active = false;
    };
  }, [isEditMode, slideId]);

  const previewUrl = useMemo(() => (form.image instanceof File ? URL.createObjectURL(form.image) : currentImage), [currentImage, form.image]);

  useEffect(() => {
    return () => {
      if (previewUrl && form.image instanceof File) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [form.image, previewUrl]);

  function handleChange(event) {
    const { name, value, files, type, checked } = event.target;
    if (name === "image") {
      setForm((current) => ({ ...current, image: files?.[0] || null }));
      return;
    }
    setForm((current) => ({ ...current, [name]: name === "order" ? Number(value) : type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEditMode) await updateSlide(slideId, form);
      else await createSlide(form);
      navigate("/admin/slides", {
        replace: true,
        state: { notice: isEditMode ? t("slides.form.update_success") : t("slides.form.create_success") },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("slides.form.save_error"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">{t("slides.form.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">{isEditMode ? t("slides.form.edit_title") : t("slides.form.create_title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("slides.form.description")}</p>
          </div>
          <Link to="/admin/slides" className="inline-flex items-center justify-center gap-2 self-start rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">
            <Icon name="arrow-left" className="h-4 w-4" />
            {t("slides.common.back")}
          </Link>
        </div>
      </section>

      {error ? <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("slides.form.fields.title")}</span>
                <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400" placeholder={t("slides.form.fields.title_placeholder")} />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("slides.form.fields.subtitle")}</span>
                <input type="text" name="subtitle" value={form.subtitle} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400" placeholder={t("slides.form.fields.subtitle_placeholder")} />
              </label>
            </div>

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">{t("slides.form.fields.description")}</span>
              <textarea name="description" rows="7" value={form.description} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400" placeholder={t("slides.form.fields.description_placeholder")} />
            </label>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_180px]">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("slides.form.fields.image")}</span>
                <input type="file" name="image" accept="image/png,image/jpeg,image/webp" onChange={handleChange} className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white" />
                {previewUrl ? (
                  <div className="overflow-hidden rounded-sm">
                    <img src={previewUrl} alt={form.title || t("slides.form.fields.image_alt")} className="h-100 w-200 object-cover" />
                  </div>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("slides.form.fields.order")}</span>
                <input type="number" min="0" name="order" value={form.order} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400" />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500" />
              <div>
                <span className="block text-sm font-bold text-slate-800">{t("slides.form.fields.active")}</span>
                <span className="block text-xs text-slate-500">{t("slides.form.fields.active_help")}</span>
              </div>
            </label>
          </div>

          <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link to="/admin/slides" className="inline-flex w-full items-center justify-center rounded-sm border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition sm:w-auto">{t("slides.common.cancel")}</Link>
              <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                {saving ? t("slides.common.saving") : isEditMode ? t("slides.common.update") : t("slides.common.save")}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
