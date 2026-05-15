import React from "react";

function FeaturedTourCard({ tour }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-stone-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <img src={tour.image} alt={tour.title} className="h-56 w-full object-cover" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${tour.color}`}>{tour.category}</span>
          <span className="font-bold text-slate-900">{tour.duration}</span>
        </div>
        <h3 className="mb-3 text-xl font-extrabold">{tour.title}</h3>
        <p className="mb-5 text-sm leading-relaxed text-slate-600">{tour.text}</p>
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">A partir de</p>
          <p className="text-2xl font-extrabold text-emerald-800">$XXX</p>
        </div>
        <div className="flex gap-3">
          <a href="#page-tour-detail" className="flex-1 rounded-full bg-emerald-700 py-3 text-center font-bold text-white transition hover:bg-emerald-800">Voir plus</a>
          <a href="#contact" className="flex-1 rounded-full border border-emerald-700 py-3 text-center font-bold text-emerald-700 transition hover:bg-emerald-50">WhatsApp</a>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedToursSection({ tours }) {
  return (
    <section id="tours" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-700">Nos circuits populaires</p>
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Choisissez votre aventure a Madagascar</h2>
          </div>
          <a href="#contact" className="font-bold text-emerald-700 hover:underline">Creer un circuit personnalise ?</a>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {tours.map((tour) => <FeaturedTourCard key={tour.title} tour={tour} />)}
        </div>
      </div>
    </section>
  );
}
