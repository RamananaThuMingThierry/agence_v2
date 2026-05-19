import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPlatformVideo, fetchPlatformVideo, updatePlatformVideo } from "../../../api/platformVideos";
import { fetchTours } from "../../../api/tours";
import { useI18n } from "../../../hooks/admin/I18nContext";

const initialForm = {
  title: "",
  description: "",
  source_type: "external",
  video_url: "",
  video_file: null,
  thumbnail: null,
  tour_id: "",
  placement: "home",
  order: 0,
  is_active: true,
};

function buildAssetUrl(path) {
  if (!path) return "";
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

export default function FormPlatformVideoPage() {
  const { t } = useI18n();
  const { videoId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(videoId);
  const [form, setForm] = useState(initialForm);
  const [currentThumbnail, setCurrentThumbnail] = useState("");
  const [currentVideoPath, setCurrentVideoPath] = useState("");
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadVideo() {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const video = await fetchPlatformVideo(videoId);
        if (!active) return;

        setForm({
          title: video?.title || "",
          description: video?.description || "",
          source_type: video?.source_type || "external",
          video_url: video?.video_url || "",
          video_file: null,
          thumbnail: null,
          tour_id: video?.tour_id ? String(video.tour_id) : "",
          placement: video?.placement || "home",
          order: video?.order ?? 0,
          is_active: video?.is_active ?? true,
        });
        setCurrentThumbnail(video?.thumbnail ? buildAssetUrl(video.thumbnail) : "");
        setCurrentVideoPath(video?.video_path ? buildAssetUrl(video.video_path) : "");
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || t("platform_videos.form.load_error"));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVideo();

    return () => {
      active = false;
    };
  }, [isEditMode, videoId, t]);

  useEffect(() => {
    let active = true;

    async function loadTours() {
      try {
        const items = await fetchTours();
        if (!active) return;
        setTours(Array.isArray(items) ? items : []);
      } catch {
        if (active) {
          setTours([]);
        }
      }
    }

    loadTours();

    return () => {
      active = false;
    };
  }, []);

  const thumbnailPreviewUrl = useMemo(
    () => (form.thumbnail instanceof File ? URL.createObjectURL(form.thumbnail) : currentThumbnail),
    [currentThumbnail, form.thumbnail],
  );

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl && form.thumbnail instanceof File) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [form.thumbnail, thumbnailPreviewUrl]);

  function handleChange(event) {
    const { name, value, files, type, checked } = event.target;

    if (name === "thumbnail" || name === "video_file") {
      setForm((current) => ({ ...current, [name]: files?.[0] || null }));
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: name === "order" ? Number(value) : type === "checkbox" ? checked : value,
      ...(name === "placement" && value === "home" ? { tour_id: "" } : {}),
      ...(name === "source_type" && value === "external" ? { video_file: null } : {}),
      ...(name === "source_type" && value === "upload" ? { video_url: "" } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEditMode) await updatePlatformVideo(videoId, form);
      else await createPlatformVideo(form);

      navigate("/admin/platform-videos", {
        replace: true,
        state: { notice: isEditMode ? t("platform_videos.form.update_success") : t("platform_videos.form.create_success") },
      });
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || t("platform_videos.form.save_error"));
      } else {
        setError(requestError.response?.data?.message || t("platform_videos.form.save_error"));
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">{t("platform_videos.form.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">{isEditMode ? t("platform_videos.form.edit_title") : t("platform_videos.form.create_title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("platform_videos.form.description")}</p>
          </div>
          <Link to="/admin/platform-videos" className="inline-flex items-center justify-center gap-2 self-start rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">
            <Icon name="arrow-left" className="h-4 w-4" />
            {t("platform_videos.common.back")}
          </Link>
        </div>
      </section>

      {error ? <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("platform_videos.form.fields.title")}</span>
                <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400" placeholder={t("platform_videos.form.fields.title_placeholder")} />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("platform_videos.form.fields.placement")}</span>
                <select name="placement" value={form.placement} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400">
                  <option value="home">{t("platform_videos.form.fields.home_placement")}</option>
                  <option value="memory">{t("platform_videos.form.fields.memory_placement")}</option>
                </select>
              </label>
            </div>

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">{t("platform_videos.form.fields.related_tour")}</span>
              <select name="tour_id" value={form.tour_id} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400">
                <option value="">{t("platform_videos.form.fields.related_tour_none")}</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>{tour.title}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">{t("platform_videos.form.fields.description")}</span>
              <textarea name="description" rows="5" value={form.description} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400" placeholder={t("platform_videos.form.fields.description_placeholder")} />
            </label>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-6">
                <label className="space-y-2">
                  <span className="block text-sm font-bold text-slate-800">{t("platform_videos.form.fields.source_type")}</span>
                  <select name="source_type" value={form.source_type} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400">
                    <option value="external">{t("platform_videos.form.fields.source_external")}</option>
                    <option value="upload">{t("platform_videos.form.fields.source_upload")}</option>
                  </select>
                </label>

                {form.source_type === "external" ? (
                  <label className="space-y-2">
                    <span className="block text-sm font-bold text-slate-800">{t("platform_videos.form.fields.video_url")}</span>
                    <input type="url" name="video_url" value={form.video_url} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400" placeholder={t("platform_videos.form.fields.video_url_placeholder")} />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <label className="space-y-2">
                      <span className="block text-sm font-bold text-slate-800">{t("platform_videos.form.fields.video_file")}</span>
                      <input type="file" name="video_file" accept="video/mp4,video/webm,video/quicktime" onChange={handleChange} className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white" />
                    </label>
                    {currentVideoPath && !form.video_file ? (
                      <video controls preload="metadata" className="max-h-72 w-full rounded-sm border border-stone-200 bg-black">
                        <source src={currentVideoPath} />
                      </video>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <span className="block text-sm font-bold text-slate-800">{t("platform_videos.form.fields.thumbnail")}</span>
                <div className="flex h-48 items-center justify-center overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
                  {thumbnailPreviewUrl ? <img src={thumbnailPreviewUrl} alt={form.title || t("platform_videos.form.fields.thumbnail_alt")} className="h-full w-full object-cover" /> : <span className="px-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("platform_videos.form.fields.thumbnail_empty")}</span>}
                </div>
                <input type="file" name="thumbnail" accept="image/png,image/jpeg,image/webp" onChange={handleChange} className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white" />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">{t("platform_videos.form.fields.order")}</span>
                <input type="number" min="0" name="order" value={form.order} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-400" />
              </label>

              <label className="flex items-center gap-3 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500" />
                <div>
                  <span className="block text-sm font-bold text-slate-800">{t("platform_videos.form.fields.active")}</span>
                  <span className="block text-xs text-slate-500">{t("platform_videos.form.fields.active_help")}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link to="/admin/platform-videos" className="inline-flex w-full items-center justify-center rounded-sm border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition sm:w-auto">{t("platform_videos.common.cancel")}</Link>
              <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                {saving ? t("platform_videos.common.saving") : isEditMode ? t("platform_videos.common.update") : t("platform_videos.common.save")}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
