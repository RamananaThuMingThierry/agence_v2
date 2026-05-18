import React from "react";

export default function TrustStatsSection({ items, className = "" }) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-white/40 bg-white/95 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.10)] backdrop-blur md:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.label} className={index < items.length - 1 ? "border-r border-slate-100 text-center" : "text-center"}>
              <p className="text-3xl font-extrabold text-amber-800">{item.value}</p>
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
