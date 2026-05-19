import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/admin/I18nContext";
import SectionTitle from "./SectionTitle";

export default function GalleryPageSection({ filters, items }) {
  const { t } = useI18n();
  const allFilterLabel = t("public.gallery.list.filters.all");
  const [activeFilter, setActiveFilter] = useState(filters[0] || allFilterLabel);

  useEffect(() => {
    if (!filters.includes(activeFilter)) {
      setActiveFilter(filters[0] || allFilterLabel);
    }
  }, [activeFilter, allFilterLabel, filters]);

  const visibleItems = useMemo(() => {
    if (activeFilter === allFilterLabel) {
      return items;
    }

    return items.filter((item) => item.category === activeFilter);
  }, [activeFilter, allFilterLabel, items]);

  return (
    <section id="page-gallery" className="bg-white py-10">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          title={t("public.gallery.list.title")}
          text={t("public.gallery.list.text")}
          center
        />
        <div className="mb-10 mt-10 flex flex-wrap justify-center gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? "rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white" : "rounded-full bg-stone-100 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-stone-200"}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleItems.map((item) => (
            <Link key={item.galleryId || item.id || item.title} to={`/galerie/${item.galleryId}`} className="group overflow-hidden rounded-3xl bg-stone-50 shadow-sm">
              <img src={item.image} alt={item.title} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{item.category}</p>
                <h3 className="font-extrabold">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.place}</p>
                {item.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p> : null}
              </div>
            </Link>
          ))}
        </div>
        {visibleItems.length === 0 ? <p className="mt-8 text-center text-sm font-semibold text-slate-500">{t("public.gallery.list.empty")}</p> : null}
      </div>
    </section>
  );
}
