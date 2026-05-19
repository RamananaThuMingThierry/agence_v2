import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";
import SectionTitle from "./SectionTitle";

export default function ReviewsSection({ testimonials = [] }) {
  const { t } = useI18n();

  return (
    <section id="reviews" className="bg-stone-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle eyebrow={t("public.home.testimonials.eyebrow")} title={t("public.home.testimonials.title")} center />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="mb-4 text-amber-400">{"\u2605\u2605\u2605\u2605\u2605"}</p>
              <p className="mb-5 leading-relaxed text-slate-600">{"\u201c"}{item.quote}{"\u201d"}</p>
              <p className="font-bold">{item.name}</p>
              <p className="text-sm text-slate-500">{item.country}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
