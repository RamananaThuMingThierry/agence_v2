import React from "react";

export default function SectionTitle({ eyebrow, title, text, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-emerald-700">{eyebrow}</p>
      <h2 className="mb-4 text-3xl font-extrabold text-slate-900 md:text-4xl">{title}</h2>
      {text ? <p className="leading-relaxed text-slate-600">{text}</p> : null}
    </div>
  );
}
