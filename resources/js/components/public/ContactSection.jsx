import React from "react";

export default function ContactSection() {
  return (
    <section id="contact" className="bg-white py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-700">Contact</p>
          <h2 className="mb-5 text-3xl font-extrabold text-slate-900 md:text-4xl">Planifiez votre voyage a Madagascar</h2>
          <p className="mb-6 leading-relaxed text-slate-600">Remplissez ce formulaire ou contactez-nous directement sur WhatsApp. Nous vous repondrons avec une proposition personnalisee.</p>
          <div className="space-y-3 text-slate-700"><p>Antananarivo, Madagascar</p><p>WhatsApp: +261 XX XX XXX XX</p><p>contact@example.com</p></div>
        </div>
        <form className="space-y-4 rounded-3xl bg-stone-50 p-6 shadow-sm"><div><label className="mb-2 block text-sm font-bold">Nom complet</label><input type="text" placeholder="Votre nom" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600" /></div><div><label className="mb-2 block text-sm font-bold">Email ou WhatsApp</label><input type="text" placeholder="Votre contact" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600" /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-bold">Date d'arrivee</label><input type="date" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600" /></div><div><label className="mb-2 block text-sm font-bold">Duree</label><input type="text" placeholder="Ex: 10 jours" className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600" /></div></div><div><label className="mb-2 block text-sm font-bold">Type de voyage</label><select className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"><option>Wildlife & Lemurs</option><option>Baobab & Tsingy</option><option>RN7 Classic Tour</option><option>Beach & Islands</option><option>Voyage sur mesure</option></select></div><div><label className="mb-2 block text-sm font-bold">Message</label><textarea rows="4" placeholder="Votre budget, vos envies, nombre de personnes..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600" /></div><button type="submit" className="w-full rounded-full bg-emerald-700 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-800">Envoyer ma demande</button></form>
      </div>
    </section>
  );
}
