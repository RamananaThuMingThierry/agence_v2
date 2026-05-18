import React from "react";
import SectionTitle from "./SectionTitle";

export default function WhyChooseSection({ items }) {
  return (
    <section id="why" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle
          eyebrow="Pourquoi choisir notre agence"
          title="Une experience locale, flexible et rassurante"
          text="Nous creons des voyages adaptes a votre rythme, votre budget et vos centres d'interet."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {items.map((item) => (
            <article key={item.title} className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className={`mb-5 flex h-12 w-12 mx-auto text-center items-center justify-center rounded-2xl text-sm font-extrabold ${item.tone}`}>
                {item.code}
              </div>
              <h3 className="mb-3 text-xl font-bold text-center">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 text-justify">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
