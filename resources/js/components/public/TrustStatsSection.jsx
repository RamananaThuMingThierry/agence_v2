import React from "react";

export default function TrustStatsSection({ items }) {
  return (
    <section className="relative z-10 -mt-10 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-white p-6 shadow-xl md:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.label} className={index < items.length - 1 ? "text-center border-r border-slate-100" : "text-center"}>
              <p className="text-3xl font-extrabold text-emerald-800">{item.value}</p>
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
