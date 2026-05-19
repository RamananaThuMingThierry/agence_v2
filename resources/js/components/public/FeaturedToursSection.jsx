import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/admin/I18nContext";

function FeaturedTourCard({ tour }) {
  const { t } = useI18n();

  return (
    <article className="public-panel overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(89,44,30,0.16)]">
      <img src={tour.image} alt={tour.title} className="h-56 w-full object-cover" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${tour.categoryTone}`}>{tour.category}</span>
          <span className="font-bold text-[color:var(--accent-deep)]">{tour.duration}</span>
        </div>
        <h3 className="public-heading mb-3 text-xl font-extrabold">{tour.title}</h3>
        <p className="public-copy mb-5 text-sm leading-relaxed">{tour.excerpt || t("public.home.tours.description_coming")}</p>
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-[color:var(--muted)]">{t("public.home.tours.from")}</p>
          <p className="public-price text-2xl font-extrabold">{tour.formattedPrice}</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/circuits/${tour.tourId}`} className="public-btn-primary flex-1 rounded-full py-3 text-center font-bold transition">{t("public.common.view_more")}</Link>
          <Link to={`/reservations/${tour.tourId}`} className="public-btn-secondary flex-1 rounded-full py-3 text-center font-bold transition">{t("public.common.book")}</Link>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedToursSection({ tours }) {
  const { t } = useI18n();

  return (
    <section id="tours" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="public-eyebrow mb-3 text-sm font-bold uppercase">{t("public.home.featured_tours.eyebrow")}</p>
            <h2 className="public-heading text-3xl font-extrabold md:text-4xl">{t("public.home.featured_tours.title")}</h2>
          </div>
          <Link to="/circuits" className="public-btn-secondary hidden items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition md:inline-flex">
            {t("public.common.view_more")}
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {tours.map((tour) => <FeaturedTourCard key={tour.tourId || tour.id || tour.title} tour={tour} />)}
        </div>
        <div className="mt-8 md:hidden">
          <Link to="/circuits" className="public-btn-secondary flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition">
            {t("public.common.view_more")}
          </Link>
        </div>
      </div>
    </section>
  );
}
