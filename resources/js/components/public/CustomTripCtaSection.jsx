import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

export default function CustomTripCtaSection({ trips }) {
  const { t } = useI18n();

  return (
    <section className="px-4 py-16 text-white sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl bg-[linear-gradient(135deg,var(--accent-dark),var(--accent-deep))] px-5 py-8 shadow-[0_26px_70px_rgba(72,33,24,0.24)] sm:px-7 sm:py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-10 md:px-10 md:py-12">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#f5d089] sm:text-sm">{t("public.home.custom_trip.eyebrow")}</p>
          <h2 className="mb-4 text-3xl font-extrabold leading-tight sm:text-4xl md:mb-5">{t("public.home.custom_trip.title")}</h2>
          <p className="mb-6 text-sm leading-7 text-white/82 sm:text-base">{t("public.home.custom_trip.text")}</p>
          <a href="#contact" className="inline-flex w-full items-center justify-center rounded-full bg-[#f5d089] px-6 py-3.5 text-center font-bold text-[color:var(--accent-deep)] shadow-[0_18px_40px_rgba(201,150,69,0.28)] transition hover:bg-[#f8dca0] sm:w-auto sm:px-7 sm:py-4">{t("public.home.custom_trip.cta")}</a>
        </div>
        <div className="rounded-3xl border border-white/12 bg-white/8 p-5 backdrop-blur-sm sm:p-6">
          <h3 className="mb-4 text-lg font-bold sm:mb-5 sm:text-xl">{t("public.home.custom_trip.examples")}</h3>
          <div className="grid gap-3 sm:gap-4">
            {trips.map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/10 p-4 text-sm leading-6 text-white/90 sm:text-base">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
