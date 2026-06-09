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
    <section id="faq" className="bg-[linear-gradient(180deg,#fdf8f2_0%,#f6ede3_100%)] py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 max-w-4xl">
          <p className="public-eyebrow mb-3 text-sm font-bold uppercase">{t("public.home.faq.eyebrow")}</p>
          <h2 className="public-heading mb-5 text-3xl font-extrabold md:text-4xl">{t("public.home.faq.title")}</h2>
          <p className="public-copy max-w-2xl leading-relaxed">
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
                    ? "border-[rgba(143,51,32,0.24)] bg-white shadow-[0_20px_50px_rgba(89,44,30,0.12)]"
                    : "border-[rgba(125,94,78,0.16)] bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="public-heading text-base font-extrabold md:text-lg">{item.question}</span>
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      open ? "bg-[color:var(--accent-dark)] text-white" : "bg-[rgba(238,225,207,0.7)] text-[color:var(--ink-soft)]"
                    }`}
                  >
                    <PlusIcon open={open} />
                  </span>
                </button>

                {open ? (
                  <div className="border-t border-[rgba(125,94,78,0.12)] px-6 py-5 text-sm leading-7 text-[color:var(--ink-soft)] md:text-base">
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
