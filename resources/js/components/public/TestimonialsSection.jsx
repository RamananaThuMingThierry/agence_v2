import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/admin/I18nContext";
import SectionTitle from "./SectionTitle";

function buildImageUrl(path) {
  if (!path) return "/images/profil.png";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
}

function normalizeTestimonial(item) {
  return {
    name: item?.name || "",
    message: item?.message || item?.quote || "",
    rating: Math.max(1, Math.min(5, Number(item?.rating || 5))),
    image: buildImageUrl(item?.image),
    meta: item?.country || "",
  };
}

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className={filled ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 fill-stone-200 text-stone-200"} aria-hidden="true">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function StarRating({ value = 5 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => <StarIcon key={star} filled={star <= value} />)}
    </div>
  );
}

export default function TestimonialsSection({ testimonials = [], showMoreHref = "/avis" }) {
  const { t } = useI18n();
  const items = testimonials.map(normalizeTestimonial);

  return (
    <section id="testimonials" className="bg-stone-100 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle eyebrow={t("public.home.testimonials.eyebrow")} title={t("public.home.testimonials.title")} center={false} />
          <Link to={showMoreHref} className="inline-flex items-center justify-center rounded-full border border-emerald-700 px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50">
            {t("public.home.testimonials.view_more")}
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <article key={`${item.name}-${index}`} className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-red-50 text-lg font-black text-red-700">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    (item.name || t("public.testimonials.list.traveler_fallback")).charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <p className="font-bold text-slate-900">{item.name || t("public.testimonials.list.traveler_fallback")}</p>
                  {item.meta ? <p className="text-sm text-slate-500">{item.meta}</p> : null}
                </div>
              </div>

              <div className="mt-5"><StarRating value={item.rating} /></div>
              <p className="mt-4 flex-1 leading-relaxed text-slate-600">"{item.message}"</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
