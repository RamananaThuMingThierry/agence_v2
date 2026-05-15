import React from "react";

export default function PhotoDetailSection({ relatedPhotos }) {
  return (
    <section id="page-photo-detail" className="bg-stone-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500"><a href="#home" className="hover:text-emerald-700">Accueil</a><span>/</span><a href="#page-gallery" className="hover:text-emerald-700">Galerie</a><span>/</span><span className="font-bold text-slate-900">Detail photo</span></div>
        <a href="#page-gallery" className="mb-8 inline-flex items-center font-bold text-emerald-700 hover:underline">Retour a la galerie complete</a>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm lg:col-span-2"><img src="https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=1400&q=80" alt="Allee des Baobabs" className="h-[520px] w-full object-cover" /></div>
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Baobabs</span><h2 className="mt-4 mb-3 text-3xl font-extrabold text-slate-900">Allee des Baobabs</h2><p className="mb-6 leading-relaxed text-slate-600">Une image peut avoir sa propre page avec description, lieu, circuit associe et bouton pour demander le voyage correspondant.</p><div className="mb-6 space-y-3 text-sm"><div className="flex justify-between border-b border-slate-100 pb-3"><span>Lieu</span><strong>Morondava</strong></div><div className="flex justify-between border-b border-slate-100 pb-3"><span>Categorie</span><strong>Photo / Nature</strong></div><div className="flex justify-between"><span>Circuit lie</span><strong>Baobab & Tsingy</strong></div></div><a href="#page-tour-detail" className="mb-3 block rounded-full bg-emerald-700 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-800">Voir le circuit lie</a><a href="#contact" className="block rounded-full border border-emerald-700 py-4 text-center font-bold text-emerald-700 transition hover:bg-emerald-50">Demander ce voyage</a></aside>
        </div>
        <div className="mt-12"><h3 className="mb-6 text-2xl font-extrabold text-slate-900">Photos similaires</h3><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{relatedPhotos.map((item) => <a key={item.title} href="#page-photo-detail" className="group block overflow-hidden rounded-3xl bg-white shadow-sm"><img src={item.image} alt={item.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" /><div className="p-4"><h4 className="font-extrabold">{item.title}</h4><p className="text-sm text-slate-500">{item.place}</p></div></a>)}</div></div>
      </div>
    </section>
  );
}
