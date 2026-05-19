import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

export default function PhotoDetailSection({ relatedPhotos = [] }) {
  const { t } = useI18n();

  return (
    <section id="page-photo-detail" className="bg-stone-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <a href="#home" className="hover:text-emerald-700">{t("public.home.nav.home")}</a>
          <span>/</span>
          <a href="#page-gallery" className="hover:text-emerald-700">{t("public.home.nav.gallery")}</a>
          <span>/</span>
          <span className="font-bold text-slate-900">{t("public.preview.photo_detail.breadcrumb")}</span>
        </div>
        <a href="#page-gallery" className="mb-8 inline-flex items-center font-bold text-emerald-700 hover:underline">{t("public.preview.photo_detail.back")}</a>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm lg:col-span-2">
            <img src="https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=1400&q=80" alt={t("public.preview.photo_detail.title")} className="h-[520px] w-full object-cover" />
          </div>
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{t("public.preview.photo_detail.badge")}</span>
            <h2 className="mb-3 mt-4 text-3xl font-extrabold text-slate-900">{t("public.preview.photo_detail.title")}</h2>
            <p className="mb-6 leading-relaxed text-slate-600">{t("public.gallery.detail.description_fallback")}</p>
            <div className="mb-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span>{t("public.gallery.detail.place")}</span>
                <strong>{t("public.preview.photo_detail.place_value")}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span>{t("public.gallery.detail.category")}</span>
                <strong>{t("public.preview.photo_detail.category_value")}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t("public.gallery.detail.related_tour")}</span>
                <strong>{t("public.preview.photo_detail.related_tour_value")}</strong>
              </div>
            </div>
            <a href="#page-tour-detail" className="mb-3 block rounded-full bg-emerald-700 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-800">{t("public.gallery.detail.view_related_tour")}</a>
            <a href="#contact" className="block rounded-full border border-emerald-700 py-4 text-center font-bold text-emerald-700 transition hover:bg-emerald-50">{t("public.gallery.detail.request_trip")}</a>
          </aside>
        </div>
        <div className="mt-12">
          <h3 className="mb-6 text-2xl font-extrabold text-slate-900">{t("public.preview.photo_detail.related")}</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedPhotos.map((item) => (
              <a key={item.title} href="#page-photo-detail" className="group block overflow-hidden rounded-3xl bg-white shadow-sm">
                <img src={item.image} alt={item.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="p-4">
                  <h4 className="font-extrabold">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.place}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
