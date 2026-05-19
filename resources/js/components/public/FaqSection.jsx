import React, { useState } from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

function PlusIcon({ open = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export default function FaqSection({ items = [] }) {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState(0);

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="bg-[linear-gradient(180deg,#fffdf8_0%,#f6f7f2_100%)] py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-700">{t("public.home.faq.eyebrow")}</p>
          <h2 className="mb-5 text-3xl font-extrabold text-slate-900 md:text-4xl">{t("public.home.faq.title")}</h2>
          <p className="max-w-xl leading-relaxed text-slate-600">
            {t("public.home.faq.text")}
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => {
            const open = openIndex === index;

            return (
              <article
                key={item.question}
                className={`overflow-hidden rounded-3xl border transition ${
                  open
                    ? "border-emerald-300 bg-white shadow-[0_20px_50px_rgba(16,185,129,0.12)]"
                    : "border-stone-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-base font-extrabold text-slate-900 md:text-lg">{item.question}</span>
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      open ? "bg-emerald-700 text-white" : "bg-stone-100 text-slate-700"
                    }`}
                  >
                    <PlusIcon open={open} />
                  </span>
                </button>

                {open ? (
                  <div className="border-t border-stone-100 px-6 py-5 text-sm leading-7 text-slate-600 md:text-base">
                    {item.answer}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
