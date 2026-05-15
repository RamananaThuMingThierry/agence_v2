import React from "react";

export default function HeroSection({ hero }) {
  return (
    <section id="home" className="relative flex min-h-[78vh] items-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(15,23,42,0.58), rgba(15,23,42,0.42)), url('${hero.image}')` }} />
      <div className="relative mx-auto max-w-7xl px-4 py-24 text-white">
        <div className="max-w-3xl">
          <span className="mb-6 inline-flex items-center rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm backdrop-blur">
            {hero.badge}
          </span>
          <h2 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl">{hero.title}</h2>
          <p className="mb-8 text-lg leading-relaxed text-white/90 md:text-xl">{hero.text}</p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a href="#contact" className="rounded-full bg-amber-400 px-7 py-4 text-center font-bold text-slate-950 shadow-lg transition hover:bg-amber-300">
              Demander un devis gratuit
            </a>
            <a href="#tours" className="rounded-full border border-white/30 bg-white/15 px-7 py-4 text-center font-bold backdrop-blur transition hover:bg-white/25">
              Voir les circuits
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/90">
            {hero.highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
