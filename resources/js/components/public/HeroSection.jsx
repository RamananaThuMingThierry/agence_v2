import React, { useEffect, useState } from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

const SLIDE_AUTOPLAY_DELAY = 8000;

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
  const { t } = useI18n();
  const items = normalizeSlides(slides, hero);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const timer = window.setTimeout(() => {
      setCurrentIndex((current) => (current + 1) % items.length);
    }, SLIDE_AUTOPLAY_DELAY);

    return () => window.clearTimeout(timer);
  }, [currentIndex, items.length]);

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
            backgroundImage: `linear-gradient(rgba(41,17,13,0.76), rgba(41,17,13,0.38)), url('${slide.image}')`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,90,61,0.26),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(199,150,69,0.2),transparent_22%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-24 text-white">
        <div className="max-w-3xl">
          <h2 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl">{activeSlide.title}</h2>
          <p className="mb-8 text-lg leading-relaxed text-white/90 md:text-xl">{activeSlide.text}</p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a href="#contact" className="rounded-full bg-[#f5d089] px-7 py-4 text-center font-bold text-[color:var(--accent-deep)] shadow-[0_18px_40px_rgba(201,150,69,0.28)] transition hover:bg-[#f8dca0]">
              {t("public.home.hero.cta.quote")}
            </a>
            <a href="#tours" className="rounded-full border border-white/24 bg-white/12 px-7 py-4 text-center font-bold backdrop-blur transition hover:bg-white/20">
              {t("public.home.hero.cta.tours")}
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/90">
            {activeSlide.highlights.map((item) => (
              <span key={item} className="rounded-full border border-white/16 bg-white/10 px-3 py-2 backdrop-blur-sm">{item}</span>
            ))}
          </div>
        </div>

        {items.length > 1 ? (
          <div className="hidden items-center gap-3 lg:flex">
            <button type="button" onClick={() => goToSlide(currentIndex - 1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/24 bg-white/10 text-xl font-bold text-white backdrop-blur transition hover:bg-white/18">
                <ArrowIcon direction="left" className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => goToSlide(currentIndex + 1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/24 bg-white/10 text-xl font-bold text-white backdrop-blur transition hover:bg-white/18">
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
              aria-label={t("public.home.hero.slide_label", { index: index + 1 })}
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

function ArrowIcon({ direction = "right", className = "h-6 w-6" }) {
  const rotate = direction === "left" ? "rotate-180" : "";

  return (
    <svg viewBox="0 0 24 24" className={`${className} ${rotate}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}
