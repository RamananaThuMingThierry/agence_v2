import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

export default function AboutSection({ founder }) {
  const { t } = useI18n();

  if (!founder) return null;

  const safariBookingsParts = String(founder.safariBookingsText || "").split("SafariBookings.com");

  return (
    <section id="about" className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="public-panel-strong relative overflow-hidden rounded-[2rem]">
            <img src={founder.image} alt={founder.name} className="h-full min-h-[520px] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(38,24,21,0.92)] via-[rgba(38,24,21,0.44)] to-transparent p-8">
              <h2 className="mt-2 text-3xl font-extrabold text-[#f5d089]">{founder.name}</h2>
              <p className="mt-2 text-sm font-semibold text-[#f7efe4]">{founder.role}</p>
            </div>
          </div>

          <div>
            <p className="public-eyebrow mb-3 text-sm font-bold uppercase">{t("public.home.about.eyebrow")}</p>
            <h2 className="public-heading text-3xl font-extrabold md:text-4xl">{t("public.home.about.title")}</h2>
            <p className="mt-4 max-w-3xl text-sm font-semibold text-[color:var(--muted)]">{founder.location}</p>
            <p className="mt-2 max-w-3xl text-sm font-semibold text-[color:var(--muted)]">{founder.experience}</p>

            <div className="public-copy mt-8 space-y-5 text-[15px] leading-8">
              {founder.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="public-soft-panel rounded-3xl p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--accent-dark)]">{t("public.home.about.languages")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {founder.languages.map((language) => <span key={language} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[color:var(--ink-soft)] shadow-[0_10px_22px_rgba(89,44,30,0.08)]">{language}</span>)}
                </div>
              </div>
              <div className="rounded-3xl border border-[color:var(--line)] bg-[rgba(238,225,207,0.72)] p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--accent-deep)]">{t("public.home.about.travelers")}</p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{founder.countries.join(", ")}</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-[rgba(143,51,32,0.16)] bg-[rgba(255,244,239,0.72)] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--accent-dark)]">{t("public.home.about.reference")}</p>
              <p className="mt-3 text-[15px] leading-7 text-[color:var(--ink-soft)]">
                {safariBookingsParts.length > 1 ? (
                  <>
                    {safariBookingsParts[0]}
                    <a
                      href="https://www.safaribookings.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[color:var(--accent-dark)] underline decoration-[rgba(143,51,32,0.35)] underline-offset-4 transition hover:text-[color:var(--accent-deep)]"
                    >
                      SafariBookings.com
                    </a>
                    {safariBookingsParts.slice(1).join("SafariBookings.com")}
                  </>
                ) : (
                  founder.safariBookingsText
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
