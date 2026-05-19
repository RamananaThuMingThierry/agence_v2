import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

export default function AboutSection({ founder }) {
  const { t } = useI18n();

  if (!founder) return null;

  return (
    <section id="about" className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="relative overflow-hidden rounded-[2rem] bg-stone-100 shadow-sm">
            <img src={founder.image} alt={founder.name} className="h-full min-h-[520px] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent p-8">
              <h2 className="mt-2 text-3xl font-extrabold text-amber-600">{founder.name}</h2>
              <p className="mt-2 text-sm font-semibold text-stone-200">{founder.role}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-700">{t("public.home.about.eyebrow")}</p>
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">{t("public.home.about.title")}</h2>
            <p className="mt-4 max-w-3xl text-sm font-semibold text-slate-500">{founder.location}</p>
            <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-500">{founder.experience}</p>

            <div className="mt-8 space-y-5 text-[15px] leading-8 text-slate-600">
              {founder.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-emerald-50 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-800">{t("public.home.about.languages")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {founder.languages.map((language) => <span key={language} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">{language}</span>)}
                </div>
              </div>
              <div className="rounded-3xl bg-stone-100 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">{t("public.home.about.travelers")}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{founder.countries.join(", ")}</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-800">{t("public.home.about.reference")}</p>
              <p className="mt-3 text-[15px] leading-7 text-slate-700">{founder.safariBookingsText}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
