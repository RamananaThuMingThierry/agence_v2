import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "../../../hooks/admin/I18nContext";
import { fetchGallery } from "../../../api/galleries";

function buildImageUrl(path) {
  if (!path) return "/images/profil.png";
  if (/^https?:\/\//i.test(path)) return path;
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

export default function GalleryDetailsPage() {
  const { galleryId } = useParams();
  const { t, locale } = useI18n();
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadGallery() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchGallery(galleryId);
        if (!active) return;
        setGallery(data);
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || t("galleries.details.load_error"));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadGallery();

    return () => {
      active = false;
    };
  }, [galleryId, t]);

  const cover = useMemo(() => gallery?.images?.find((image) => image.is_cover) || gallery?.images?.[0] || null, [gallery]);

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">{t("galleries.details.loading")}</div>;
  }

  if (error) {
    return <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">{t("galleries.details.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("galleries.details.description")}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/admin/galleries" className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">
              {t("galleries.common.back")}
            </Link>
            <Link to={`/admin/galleries/${gallery?.encrypted_id}/edit`} className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700">
              {t("galleries.common.edit")}
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
        <div className="grid gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
              <img src={buildImageUrl(cover?.image_url)} alt={gallery?.title || t("galleries.details.image_alt")} className="h-72 w-full object-cover" />
            </div>
            <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("galleries.details.cover")}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{cover?.caption || gallery?.title || "-"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailCard label={t("galleries.details.fields.title")} value={gallery?.title} />
              <DetailCard label={t("galleries.details.fields.category")} value={gallery?.category?.name} />
              <DetailCard label={t("galleries.details.fields.subtitle")} value={gallery?.subtitle} />
              <DetailCard label={t("galleries.details.fields.place")} value={gallery?.place} />
              <DetailCard label={t("galleries.details.fields.tour")} value={gallery?.tour?.title} />
              <DetailCard label={t("galleries.details.fields.status")} value={gallery?.status === "publish" ? t("galleries.status.publish") : t("galleries.status.draft")} />
              <DetailCard label={t("galleries.details.fields.images_count")} value={String(gallery?.images?.length || 0)} />
              <DetailCard label={t("galleries.details.fields.created_at")} value={gallery?.created_at ? new Date(gallery.created_at).toLocaleString(locale) : "-"} />
              <DetailCard label={t("galleries.details.fields.updated_at")} value={gallery?.updated_at ? new Date(gallery.updated_at).toLocaleString(locale) : "-"} />
            </div>

            <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("galleries.details.fields.description")}</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{gallery?.description || "-"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-6 py-5">
          <h3 className="text-lg font-extrabold text-slate-950">{t("galleries.details.images.title")}</h3>
          <p className="mt-2 text-sm text-slate-500">{t("galleries.details.images.description")}</p>
        </div>

        <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-3">
          {(gallery?.images || []).map((image) => (
            <div key={image.encrypted_id || image.id} className="overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
              <img src={buildImageUrl(image.image_url)} alt={image.caption || gallery?.title || t("galleries.details.image_alt")} className="h-56 w-full object-cover" />
              <div className="space-y-3 px-4 py-4">
                {image.is_cover ? <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-700">{t("galleries.details.cover")}</span> : null}
                <p className="text-sm font-semibold text-slate-900">{image.caption || t("galleries.details.images.no_caption")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
