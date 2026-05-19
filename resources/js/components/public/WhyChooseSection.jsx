import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";
import SectionTitle from "./SectionTitle";

function getWhyChooseIcon(name) {
  const common = {
    className: "h-6 w-6",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "map-pin":
      return (
        <svg {...common}>
          <path d="M12 21s6-4.5 6-10a6 6 0 1 0-12 0c0 5.5 6 10 6 10Z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      );
    case "route":
      return (
        <svg {...common}>
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="6" r="2" />
          <path d="M8 18c5 0 3-8 8-8" />
          <path d="M14 10h4V6" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M5 19c7 0 14-5 14-14C10 5 5 10 5 19Z" />
          <path d="M5 19c0-4 4-8 9-9" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5A8.5 8.5 0 1 1 21 11.5Z" />
          <path d="M8.5 11.5h7" />
          <path d="M8.5 15h4.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function WhyChooseSection({ items }) {
  const { t } = useI18n();

  return (
    <section id="why" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle
          eyebrow={t("public.home.why.eyebrow")}
          title={t("public.home.why.title")}
          text={t("public.home.why.text")}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {items.map((item) => {
            const icon = typeof item.icon === "string" ? getWhyChooseIcon(item.icon) : item.icon;
            const visual = React.isValidElement(icon) ? icon : item.code;

            return (
              <article key={item.title} className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className={`mb-5 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold ${item.tone}`}>
                  {visual}
                </div>
                <h3 className="mb-3 text-center text-xl font-bold">{item.title}</h3>
                <p className="text-justify text-sm leading-relaxed text-slate-600">{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
