import React from "react";

export default function CustomTripCtaSection({ trips }) {
  return (
    <section className="bg-emerald-900 py-20 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-300">Voyage personnalise</p>
          <h2 className="mb-5 text-3xl font-extrabold md:text-4xl">Vous ne savez pas quel circuit choisir ?</h2>
          <p className="mb-6 leading-relaxed text-white/80">Envoyez-nous vos dates, votre budget et vos envies. Nous preparons un itineraire adapte pour votre sejour a Madagascar.</p>
          <a href="#contact" className="inline-flex rounded-full bg-amber-400 px-7 py-4 font-bold text-slate-950 shadow-lg transition hover:bg-amber-300">Recevoir une proposition gratuite</a>
        </div>
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6"><h3 className="mb-5 text-xl font-bold">Exemples de voyages</h3><div className="space-y-4">{trips.map((item) => <div key={item} className="rounded-2xl bg-white/10 p-4">{item}</div>)}</div></div>
      </div>
    </section>
  );
}
