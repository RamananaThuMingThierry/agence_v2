import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/admin/I18nContext";

function FeaturedTourCard({ tour }) {
  const { t } = useI18n();

  return (
    <article className="overflow-hidden rounded-3xl bg-stone-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <img src={tour.image} alt={tour.title} className="h-56 w-full object-cover" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${tour.categoryTone}`}>{tour.category}</span>
          <span className="font-bold text-slate-900">{tour.duration}</span>
        </div>
        <h3 className="mb-3 text-xl font-extrabold">{tour.title}</h3>
        <p className="mb-5 text-sm leading-relaxed text-slate-600">{tour.excerpt || t("public.home.tours.description_coming")}</p>
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">{t("public.home.tours.from")}</p>
          <p className="text-2xl font-extrabold text-emerald-800">{tour.formattedPrice}</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/circuits/${tour.tourId}`} className="flex-1 rounded-full bg-emerald-700 py-3 text-center font-bold text-white transition hover:bg-emerald-800">{t("public.common.view_more")}</Link>
          <Link to={`/reservations/${tour.tourId}`} className="flex-1 rounded-full border border-emerald-700 py-3 text-center font-bold text-emerald-700 transition hover:bg-emerald-50">{t("public.common.book")}</Link>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedToursSection({ tours }) {
  const { t } = useI18n();

  return (
    <section id="tours" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-700">{t("public.home.featured_tours.eyebrow")}</p>
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">{t("public.home.featured_tours.title")}</h2>
          </div>
          <Link to="/circuits" className="inline-flex items-center justify-center rounded-full border border-emerald-700 px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50">
            {t("public.common.view_more")}
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {tours.map((tour) => <FeaturedTourCard key={tour.tourId || tour.id || tour.title} tour={tour} />)}
        </div>
      </div>
    </section>
  );
}
