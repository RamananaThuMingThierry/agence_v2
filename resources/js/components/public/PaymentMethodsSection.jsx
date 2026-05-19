import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

export default function PaymentMethodsSection({ methods }) {
  const { t } = useI18n();

  return (
    <section id="payments" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 rounded-3xl bg-slate-950 p-8 text-white md:grid-cols-2 md:items-center md:p-10">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-300">{t("public.home.payments.eyebrow")}</p>
            <h2 className="mb-4 text-3xl font-extrabold">{t("public.home.payments.title")}</h2>
            <p className="leading-relaxed text-white/70">{t("public.home.payments.text")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{methods.map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center font-extrabold text-slate-900">{item}</div>)}</div>
        </div>
      </div>
    </section>
  );
}
