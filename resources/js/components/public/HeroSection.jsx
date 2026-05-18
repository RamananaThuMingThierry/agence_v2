import React, { useEffect, useState } from "react";

function normalizeSlides(slides = [], fallbackHero) {
  if (Array.isArray(slides) && slides.length > 0) {
    return slides.map((slide, index) => ({
      id: slide.encrypted_id || slide.id || index,
      badge: slide.subtitle || fallbackHero.badge,
      title: slide.title || fallbackHero.title,
      text: slide.description || fallbackHero.text,
      image: slide.image ? `/${String(slide.image).replace(/^\/+/, "")}` : fallbackHero.image,
      highlights: fallbackHero.highlights,
    }));
  }

  return [{
    id: "fallback-hero",
    badge: fallbackHero.badge,
    title: fallbackHero.title,
    text: fallbackHero.text,
    image: fallbackHero.image,
    highlights: fallbackHero.highlights,
  }];
}

export default function HeroSection({ hero, slides = [], children = null }) {
  const items = normalizeSlides(slides, hero);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % items.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [items.length]);

  const activeSlide = items[currentIndex];

  function goToSlide(nextIndex) {
    const normalized = (nextIndex + items.length) % items.length;
    setCurrentIndex(normalized);
  }

  return (
    <section id="home" className="relative flex min-h-[78vh] items-center overflow-hidden pb-24 md:overflow-visible">
      {items.map((slide, index) => (
        <div
          key={slide.id}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.58), rgba(15,23,42,0.42)), url('${slide.image}')`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}

      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-24 text-white">
        <div className="max-w-3xl">
          <h2 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl">{activeSlide.title}</h2>
          <p className="mb-8 text-lg leading-relaxed text-white/90 md:text-xl">{activeSlide.text}</p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a href="#contact" className="rounded-sm bg-amber-400 px-7 py-4 text-center font-bold text-slate-950 shadow-lg transition hover:bg-amber-300">
              Demander un devis gratuit
            </a>
            <a href="#tours" className="rounded-sm border border-white/30 bg-white/15 px-7 py-4 text-center font-bold backdrop-blur transition hover:bg-white/25">
              Voir les circuits
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/90">
            {activeSlide.highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        {items.length > 1 ? (
          <div className="hidden items-center gap-3 lg:flex">
            <button type="button" onClick={() => goToSlide(currentIndex - 1)} className="inline-flex h-12 w-12 items-center justify-center rounded-sm border border-white/30 bg-white/10 text-xl font-bold text-white backdrop-blur transition hover:bg-white/20">
                <ArrowIcon direction="left" className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => goToSlide(currentIndex + 1)} className="inline-flex h-12 w-12 items-center justify-center rounded-sm border border-white/30 bg-white/10 text-xl font-bold text-white backdrop-blur transition hover:bg-white/20">
                <ArrowIcon direction="right" className="h-6 w-6" />
            </button>
          </div>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {items.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition ${index === currentIndex ? "w-10 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"}`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}

      {children ? (
        <div className="absolute inset-x-0 bottom-0 z-20 hidden translate-y-1/2 md:block">
          {children}
        </div>
      ) : null}
    </section>
  );
}
