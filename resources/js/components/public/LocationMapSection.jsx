import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

export default function LocationMapSection({ location }) {
  const { t } = useI18n();
  const query = location?.query || t("public.home.location.map_query");
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;

  return (
    <section id="location" className="bg-stone-100 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid">
          <div className="overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-slate-200">
            <iframe
              title={t("public.home.location.map_title")}
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[500px] w-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
