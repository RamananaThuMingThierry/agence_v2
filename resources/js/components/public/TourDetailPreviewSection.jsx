import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

export default function TourDetailPreviewSection({ paymentMethods = [] }) {
  const { t } = useI18n();

  return (
    <section id="page-tour-detail" className="bg-stone-50 py-20">
      <div className="mx-auto mb-8 max-w-7xl px-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <a href="#home" className="hover:text-emerald-700">{t("public.home.nav.home")}</a>
          <span>/</span>
          <a href="#all-tours" className="hover:text-emerald-700">{t("public.home.nav.tours")}</a>
          <span>/</span>
          <span className="font-bold text-slate-900">{t("public.preview.tour_detail.breadcrumb")}</span>
        </div>
        <a href="#all-tours" className="inline-flex items-center font-bold text-emerald-700 hover:underline">{t("public.preview.tour_detail.back")}</a>
      </div>
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm lg:col-span-2">
            <img src="https://images.unsplash.com/photo-1612362766857-39a4fe79f966?auto=format&fit=crop&w=1400&q=80" alt={t("public.preview.tour_detail.title")} className="h-80 w-full object-cover" />
            <div className="p-6 md:p-8">
              <div className="mb-5 flex flex-wrap gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{t("public.preview.tour_detail.badges.category")}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{t("public.preview.tour_detail.badges.duration")}</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{t("public.preview.tour_detail.badges.departure")}</span>
              </div>
              <h2 className="mb-4 text-3xl font-extrabold text-slate-900 md:text-4xl">{t("public.preview.tour_detail.title")}</h2>
              <p className="mb-8 leading-relaxed text-slate-600">{t("public.preview.tour_detail.description")}</p>
              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm text-slate-500">{t("public.booking.summary.duration")}</p>
                  <p className="font-extrabold text-slate-900">{t("public.preview.tour_detail.summary.duration_value")}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm text-slate-500">{t("public.tour_detail.summary.style")}</p>
                  <p className="font-extrabold text-slate-900">{t("public.preview.tour_detail.summary.style_value")}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm text-slate-500">{t("public.tour_detail.summary.price")}</p>
                  <p className="font-extrabold text-emerald-800">{t("public.preview.tour_detail.summary.price_value")}</p>
                </div>
              </div>
              <h3 className="mb-4 text-2xl font-extrabold text-slate-900">{t("public.tour_detail.program_title")}</h3>
              <div className="mb-8 space-y-5">
                <div className="border-l-4 border-emerald-700 pl-5">
                  <h4 className="font-extrabold text-slate-900">{t("public.preview.tour_detail.program.day1_title")}</h4>
                  <p className="text-sm leading-relaxed text-slate-600">{t("public.preview.tour_detail.program.day1_text")}</p>
                </div>
                <div className="border-l-4 border-emerald-700 pl-5">
                  <h4 className="font-extrabold text-slate-900">{t("public.preview.tour_detail.program.day2_title")}</h4>
                  <p className="text-sm leading-relaxed text-slate-600">{t("public.preview.tour_detail.program.day2_text")}</p>
                </div>
                <div className="border-l-4 border-emerald-700 pl-5">
                  <h4 className="font-extrabold text-slate-900">{t("public.preview.tour_detail.program.day3_title")}</h4>
                  <p className="text-sm leading-relaxed text-slate-600">{t("public.preview.tour_detail.program.day3_text")}</p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl bg-emerald-50 p-6">
                  <h3 className="mb-4 font-extrabold text-emerald-900">{t("public.tour_detail.included")}</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>{t("public.preview.tour_detail.included_items.0")}</li>
                    <li>{t("public.preview.tour_detail.included_items.1")}</li>
                    <li>{t("public.preview.tour_detail.included_items.2")}</li>
                    <li>{t("public.preview.tour_detail.included_items.3")}</li>
                  </ul>
                </div>
                <div className="rounded-3xl bg-rose-50 p-6">
                  <h3 className="mb-4 font-extrabold text-rose-900">{t("public.tour_detail.excluded")}</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>{t("public.preview.tour_detail.excluded_items.0")}</li>
                    <li>{t("public.preview.tour_detail.excluded_items.1")}</li>
                    <li>{t("public.preview.tour_detail.excluded_items.2")}</li>
                    <li>{t("public.preview.tour_detail.excluded_items.3")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-1">
            <div className="sticky top-28 rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-2xl font-extrabold text-slate-900">{t("public.preview.tour_detail.sidebar.title")}</h3>
              <p className="mb-6 text-sm text-slate-600">{t("public.preview.tour_detail.sidebar.text")}</p>
              <div className="mb-6 space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span>{t("public.booking.summary.duration")}</span>
                  <strong>3 {t("public.preview.tour_detail.sidebar.days")}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span>{t("public.booking.summary.departure")}</span>
                  <strong>{t("public.preview.tour_detail.sidebar.departure_value")}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span>{t("public.tour_detail.summary.type")}</span>
                  <strong>{t("public.tour_detail.summary.private")}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{t("public.tour_detail.summary.price")}</span>
                  <strong className="text-emerald-800">{t("public.preview.tour_detail.sidebar.price_value")}</strong>
                </div>
              </div>
              <a href="#contact" className="mb-3 block rounded-full bg-emerald-700 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-800">{t("public.common.quote")}</a>
              <a href="#contact" className="block rounded-full border border-emerald-700 py-4 text-center font-bold text-emerald-700 transition hover:bg-emerald-50">{t("public.preview.tour_detail.sidebar.whatsapp")}</a>
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h4 className="mb-3 font-extrabold text-slate-900">{t("public.tour_detail.sidebar.payments")}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                  {paymentMethods.map((item) => <span key={item} className="rounded-xl bg-slate-100 px-3 py-2 text-center">{item}</span>)}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
