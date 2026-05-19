import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/admin/I18nContext";
import SectionTitle from "./SectionTitle";

export default function ToursCatalogSection({ tours }) {
  const { t } = useI18n();

  return (
    <section id="all-tours" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle
          eyebrow={t("public.home.tours_catalog.eyebrow")}
          title={t("public.home.tours_catalog.title")}
          text={t("public.home.tours_catalog.text")}
        />
        <div className="public-panel overflow-hidden rounded-3xl">
          <div className="hidden grid-cols-12 gap-4 bg-[linear-gradient(135deg,var(--accent-dark),var(--accent-deep))] px-6 py-4 text-sm font-bold text-white md:grid">
            <div className="col-span-4">{t("public.home.tours_catalog.table.tour")}</div>
            <div className="col-span-2">{t("public.home.tours_catalog.table.duration")}</div>
            <div className="col-span-2">{t("public.home.tours_catalog.table.style")}</div>
            <div className="col-span-2">{t("public.home.tours_catalog.table.departure")}</div>
            <div className="col-span-2 text-right">{t("public.home.tours_catalog.table.action")}</div>
          </div>
          <div className="divide-y divide-[rgba(125,94,78,0.12)]">
            {tours.map((tour) => (
              <div key={tour.tourId || tour.id || tour.title} className="grid items-center gap-4 px-6 py-5 transition hover:bg-[rgba(246,217,203,0.16)] md:grid-cols-12">
                <div className="md:col-span-4"><h3 className="public-heading font-extrabold">{tour.title}</h3><p className="text-sm text-[color:var(--muted)]">{tour.excerpt || tour.description || t("public.home.tours.description_coming")}</p></div>
                <div className="text-sm font-semibold md:col-span-2">{tour.duration}</div>
                <div className="md:col-span-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${tour.categoryTone}`}>{tour.category}</span></div>
                <div className="text-sm text-[color:var(--ink-soft)] md:col-span-2">{tour.departure}</div>
                <div className="flex gap-4 md:col-span-2 md:justify-end md:text-right"><Link to={`/circuits/${tour.tourId}`} className="public-link font-bold hover:underline">{t("public.common.view_more")}</Link><a href="/#contact" className="font-bold text-[color:var(--muted)] hover:text-[color:var(--accent)] hover:underline">{t("public.common.quote")}</a></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
