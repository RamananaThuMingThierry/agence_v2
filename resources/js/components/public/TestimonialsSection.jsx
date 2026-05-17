import React from "react";
import SectionTitle from "./SectionTitle";

function buildImageUrl(path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
}

function normalizeTestimonial(item) {
  return {
    name: item?.name || "Voyageur",
    message: item?.message || item?.quote || "",
    rating: Math.max(1, Math.min(5, Number(item?.rating || 5))),
    image: buildImageUrl(item?.image),
    meta: item?.country || "",
  };
}

export default function TestimonialsSection({ testimonials = [] }) {
  const items = testimonials.map(normalizeTestimonial);

  return (
    <section id="testimonials" className="bg-stone-100 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle eyebrow="Avis clients" title="Ils ont voyage avec nous" center />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <article key={`${item.name}-${index}`} className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-red-50 text-lg font-black text-red-700">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    item.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  {item.meta ? <p className="text-sm text-slate-500">{item.meta}</p> : null}
                </div>
              </div>

              <p className="mt-5 text-sm tracking-[0.22em] text-amber-500">{"★".repeat(item.rating)}</p>
              <p className="mt-4 flex-1 leading-relaxed text-slate-600">“{item.message}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
