import React from "react";
import SectionTitle from "./SectionTitle";

export default function GalleryPageSection({ filters, items }) {
  return (
    <section id="page-gallery" className="bg-white py-20">
      <div className="mx-auto mb-8 max-w-7xl px-4"><div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500"><a href="#home" className="hover:text-emerald-700">Accueil</a><span>/</span><span className="font-bold text-slate-900">Galerie complete</span></div><a href="#gallery" className="inline-flex items-center font-bold text-emerald-700 hover:underline">Retour a l'apercu galerie</a></div>
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle eyebrow="Galerie complete" title="Voir plus de photos du voyage" text="Cette section peut devenir une page separee avec filtres : Baobabs, Lemuriens, Plages, Parcs, Clients, Hotels et Vehicules." center />
        <div className="mb-10 mt-10 flex flex-wrap justify-center gap-3">{filters.map((filter, index) => <button key={filter} className={index === 0 ? "rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white" : "rounded-full bg-stone-100 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-stone-200"}>{filter}</button>)}</div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => <a key={item.title} href="#page-photo-detail" className="group block overflow-hidden rounded-3xl bg-stone-50 shadow-sm"><img src={item.image} alt={item.title} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" /><div className="p-4"><h3 className="font-extrabold">{item.title}</h3><p className="text-sm text-slate-500">{item.place}</p></div></a>)}</div>
      </div>
    </section>
  );
}
