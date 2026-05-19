import React from "react";

export default function TrustStatsSection({ items, className = "", containerClassName = "", panelClassName = "" }) {
  return (
    <section className={className}>
      <div className={`mx-auto max-w-6xl px-0 ${containerClassName}`.trim()}>
        <div className={`grid grid-cols-2 gap-4 rounded-[2rem] border border-[rgba(255,255,255,0.45)] bg-[rgba(255,248,242,0.92)] p-6 shadow-[0_18px_42px_rgba(72,33,24,0.12)] backdrop-blur md:grid-cols-4 ${panelClassName}`.trim()}>
          {items.map((item, index) => (
            <div key={item.label} className={index < items.length - 1 ? "border-r border-[rgba(125,94,78,0.12)] text-center" : "text-center"}>
              <p className="text-3xl font-extrabold text-[color:var(--accent-dark)]">{item.value}</p>
              <p className="text-sm text-[color:var(--muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
