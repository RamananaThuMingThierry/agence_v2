import React from "react";
import SectionTitle from "./SectionTitle";

export default function ReviewsSection({ testimonials }) {
  return (
    <section id="reviews" className="bg-stone-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle eyebrow="Avis clients" title="Ils ont voyage avec nous" center />
        <div className="mt-12 grid gap-6 md:grid-cols-3">{testimonials.map((item) => <article key={item.name} className="rounded-3xl bg-white p-6 shadow-sm"><p className="mb-4 text-amber-400">?????</p><p className="mb-5 leading-relaxed text-slate-600">“{item.quote}”</p><p className="font-bold">{item.name}</p><p className="text-sm text-slate-500">{item.country}</p></article>)}</div>
      </div>
    </section>
  );
}
