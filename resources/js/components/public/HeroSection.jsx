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
      <div className="absolute inset-0 overflow-hidden">
        {items.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 h-full w-full scale-[1.01] object-cover blur-[1px] transition-opacity duration-700"
            style={{
              opacity: index === currentIndex ? 1 : 0,
            }}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}

        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-center gap-6 px-4 py-24 text-center text-white">
        <div className="max-w-4xl">
          <h2 className="mb-7 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_10px_26px_rgba(0,0,0,0.45)] md:text-6xl lg:text-7xl" style={{ fontFamily: '"Georgia", "Times New Roman", serif' }}>
            <span className="block">{activeSlide.title}</span>
            <span className="mx-auto mt-5 block h-1.5 w-28 rounded-full bg-[#f5d089] shadow-[0_0_26px_rgba(245,208,137,0.6)]" />
          </h2>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a href="#contact" className="rounded-full bg-[#f5d089] px-7 py-4 text-center font-bold text-[color:var(--accent-deep)] shadow-[0_18px_40px_rgba(201,150,69,0.28)] transition hover:bg-[#f8dca0]">
              {t("public.home.hero.cta.quote")}
            </a>
            <a href="#tours" className="rounded-full border border-white/24 bg-white/12 px-7 py-4 text-center font-bold transition hover:bg-white/20">
              {t("public.home.hero.cta.tours")}
            </a>
          </div>
        </div>

        {items.length > 1 ? (
          <div className="absolute right-4 hidden items-center gap-3 lg:flex">
            <button type="button" onClick={() => goToSlide(currentIndex - 1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/24 bg-white/10 text-xl font-bold text-white transition hover:bg-white/18">
                <ArrowIcon direction="left" className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => goToSlide(currentIndex + 1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/24 bg-white/10 text-xl font-bold text-white transition hover:bg-white/18">
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
