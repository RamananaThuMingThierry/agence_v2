import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "./SectionTitle";

export default function GalleryPageSection({ filters, items }) {
  const [activeFilter, setActiveFilter] = useState(filters[0] || "Tous");

  const visibleItems = useMemo(() => {
    if (activeFilter === "Tous") {
      return items;
    }

    return items.filter((item) => item.category === activeFilter);
  }, [activeFilter, items]);

  return (
    <section id="page-gallery" className="bg-white py-10">
      <div className="mx-auto max-w-7xl">
        <SectionTitle title="Voir plus de photos du voyage" text="Cette page affiche la liste complete des galleries disponibles avec les filtres prevus pour la navigation publique." center />
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
        {visibleItems.length === 0 ? <p className="mt-8 text-center text-sm font-semibold text-slate-500">Aucune gallery disponible pour ce filtre.</p> : null}
      </div>
    </section>
  );
}
