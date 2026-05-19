import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/admin/I18nContext";
import SectionTitle from "./SectionTitle";

export default function GalleryPreviewSection({ items }) {
  const { t } = useI18n();
  const featuredItem = items[0] || null;
  const secondaryItems = featuredItem ? items.slice(1) : items;

  return (
    <section id="gallery" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow={t("public.home.gallery.eyebrow")}
            title={t("public.home.gallery.title")}
            text={t("public.home.gallery.text")}
          />
          <Link to="/galerie" className="public-btn-primary rounded-full px-6 py-3 font-bold transition">
            {t("public.home.gallery.view_all")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featuredItem ? (
            <Link to={`/galerie/${featuredItem.galleryId}`} className="group relative col-span-2 row-span-2 overflow-hidden rounded-3xl">
              <img src={featuredItem.image} alt={featuredItem.title} className="h-full min-h-[420px] w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-2xl font-extrabold text-white">{featuredItem.title}</p>
                <p className="mt-2 text-sm font-medium text-white/85">{featuredItem.place}</p>
              </div>
            </Link>
          ) : null}
          {secondaryItems.map((item) => (
            <Link key={item.galleryId || item.id || item.title} to={`/galerie/${item.galleryId}`} className="group relative overflow-hidden rounded-3xl">
              <img src={item.image} alt={item.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-4 left-4 font-bold text-white">{item.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
