import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

const PAYMENT_METHOD_IMAGES = [
  { matches: ["mastercard"], file: "mastercard.png" },
  { matches: ["visa"], file: "visa.png" },
  { matches: ["american express", "amex"], file: "american_express.png" },
  { matches: ["virement", "bank transfer", "bankuberweisung", "transferencia bancaria"], file: "virement.png" },
  { matches: ["especes", "cash", "barzahlung", "efectivo"], file: "cash.png" },
  { matches: ["mobile money"], file: "mobile_money.png" },
];

function normalizeMethodName(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getPaymentMethodImage(method) {
  const normalized = normalizeMethodName(method);
  return PAYMENT_METHOD_IMAGES.find(({ matches }) => matches.some((match) => normalized.includes(match)))?.file;
}

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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {methods.map((item) => {
              const imageFile = getPaymentMethodImage(item);

              return (
                <div key={item} className="flex h-24 items-center justify-center rounded-2xl bg-white p-4">
                  {imageFile ? (
                    <img src={`/paymentMethod/${imageFile}`} alt={item} className="max-h-14 max-w-full object-contain" loading="lazy" />
                  ) : (
                    <span className="text-center font-extrabold text-slate-900">{item}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
