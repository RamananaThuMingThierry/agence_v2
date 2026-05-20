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
    <section id="page-gallery" className="py-10">
      <div className="mx-auto max-w-7xl px-4">
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
              className={activeFilter === filter ? "rounded-full bg-[color:var(--accent-dark)] px-5 py-2.5 text-sm font-bold text-white" : "rounded-full bg-stone-100 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-stone-200"}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleItems.map((item) => (
            <Link key={item.galleryId || item.id || item.title} to={`/galerie/${item.galleryId}`} className="public-panel group overflow-hidden rounded-3xl">
              <img src={item.image} alt={item.title} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--accent-dark)]">{item.category}</p>
                <h3 className="font-extrabold">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.place}</p>
                {item.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p> : null}
              </div>
            </Link>
          ))}
        </div>
        {visibleItems.length === 0 ? <p className="mt-12 px-6 py-20 text-center text-xl font-bold leading-relaxed text-[color:var(--accent-deep)] md:text-2xl">{t("public.gallery.list.empty")}</p> : null}
      </div>
    </section>
  );
}
