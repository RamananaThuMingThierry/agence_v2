import React from "react";
import SectionTitle from "./SectionTitle";

export default function LocationMapSection({ location }) {
  const title = location?.title || "Notre localisation";
  const text = location?.text || "Retrouvez World of Madagascar Tour a Antananarivo.";
  const address = location?.address || "Antananarivo, Madagascar";
  const query = location?.query || "World of Madagascar Tour Antananarivo Madagascar";
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;

  return (
    <section id="location" className="bg-stone-100 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <iframe
              title="Carte World of Madagascar Tour"
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
