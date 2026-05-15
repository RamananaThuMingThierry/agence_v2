import React from "react";

export default function TourDetailPreviewSection({ paymentMethods }) {
  return (
    <section id="page-tour-detail" className="bg-stone-50 py-20">
      <div className="mx-auto mb-8 max-w-7xl px-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500"><a href="#home" className="hover:text-emerald-700">Accueil</a><span>/</span><a href="#all-tours" className="hover:text-emerald-700">Circuits</a><span>/</span><span className="font-bold text-slate-900">Detail du circuit</span></div>
        <a href="#all-tours" className="inline-flex items-center font-bold text-emerald-700 hover:underline">Retour a la liste des circuits</a>
      </div>
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm lg:col-span-2">
            <img src="https://images.unsplash.com/photo-1612362766857-39a4fe79f966?auto=format&fit=crop&w=1400&q=80" alt="Andasibe Lemur Tour" className="h-80 w-full object-cover" />
            <div className="p-6 md:p-8">
              <div className="mb-5 flex flex-wrap gap-3"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Nature</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">3 jours / 2 nuits</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Depart Antananarivo</span></div>
              <h2 className="mb-4 text-3xl font-extrabold text-slate-900 md:text-4xl">Andasibe Lemur Tour</h2>
              <p className="mb-8 leading-relaxed text-slate-600">Un circuit court et ideal pour decouvrir la foret tropicale de Madagascar, observer les lemuriens Indri-Indri, visiter les reserves naturelles et profiter d'un voyage prive avec guide local.</p>
              <div className="mb-8 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-stone-50 p-4"><p className="text-sm text-slate-500">Duree</p><p className="font-extrabold text-slate-900">3 jours</p></div><div className="rounded-2xl bg-stone-50 p-4"><p className="text-sm text-slate-500">Style</p><p className="font-extrabold text-slate-900">Nature & Wildlife</p></div><div className="rounded-2xl bg-stone-50 p-4"><p className="text-sm text-slate-500">Prix</p><p className="font-extrabold text-emerald-800">A partir de $XXX</p></div></div>
              <h3 className="mb-4 text-2xl font-extrabold text-slate-900">Programme du circuit</h3>
              <div className="mb-8 space-y-5"><div className="border-l-4 border-emerald-700 pl-5"><h4 className="font-extrabold text-slate-900">Jour 1 — Antananarivo vers Andasibe</h4><p className="text-sm leading-relaxed text-slate-600">Depart depuis Antananarivo, route vers Andasibe, arrets photos et visite nocturne selon l'heure d'arrivee.</p></div><div className="border-l-4 border-emerald-700 pl-5"><h4 className="font-extrabold text-slate-900">Jour 2 — Parc national d'Andasibe</h4><p className="text-sm leading-relaxed text-slate-600">Visite guidee du parc pour observer les lemuriens, oiseaux, cameleons et plantes endemiques.</p></div><div className="border-l-4 border-emerald-700 pl-5"><h4 className="font-extrabold text-slate-900">Jour 3 — Retour a Antananarivo</h4><p className="text-sm leading-relaxed text-slate-600">Visite optionnelle d'une reserve privee puis retour a Antananarivo.</p></div></div>
              <div className="grid gap-6 md:grid-cols-2"><div className="rounded-3xl bg-emerald-50 p-6"><h3 className="mb-4 font-extrabold text-emerald-900">Inclus</h3><ul className="space-y-2 text-sm text-slate-700"><li>Voiture privee avec chauffeur</li><li>Guide local</li><li>Entrees selon programme</li><li>Assistance WhatsApp</li></ul></div><div className="rounded-3xl bg-rose-50 p-6"><h3 className="mb-4 font-extrabold text-rose-900">Non inclus</h3><ul className="space-y-2 text-sm text-slate-700"><li>Vols internationaux</li><li>Repas non mentionnes</li><li>Depenses personnelles</li><li>Pourboires</li></ul></div></div>
            </div>
          </div>
          <aside className="lg:col-span-1"><div className="sticky top-28 rounded-3xl bg-white p-6 shadow-sm"><h3 className="mb-2 text-2xl font-extrabold text-slate-900">Demander ce circuit</h3><p className="mb-6 text-sm text-slate-600">Le client peut poser une question, verifier la disponibilite ou demander une version personnalisee.</p><div className="mb-6 space-y-3 text-sm"><div className="flex justify-between border-b border-slate-100 pb-3"><span>Duree</span><strong>3 jours</strong></div><div className="flex justify-between border-b border-slate-100 pb-3"><span>Depart</span><strong>Tana</strong></div><div className="flex justify-between border-b border-slate-100 pb-3"><span>Type</span><strong>Prive</strong></div><div className="flex justify-between"><span>Prix</span><strong className="text-emerald-800">$XXX</strong></div></div><a href="#contact" className="mb-3 block rounded-full bg-emerald-700 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-800">Demander un devis</a><a href="#contact" className="block rounded-full border border-emerald-700 py-4 text-center font-bold text-emerald-700 transition hover:bg-emerald-50">Question sur WhatsApp</a><div className="mt-6 border-t border-slate-100 pt-6"><h4 className="mb-3 font-extrabold text-slate-900">Paiements acceptes</h4><div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">{paymentMethods.map((item) => <span key={item} className="rounded-xl bg-slate-100 px-3 py-2 text-center">{item}</span>)}</div></div></div></aside>
        </div>
      </div>
    </section>
  );
}
