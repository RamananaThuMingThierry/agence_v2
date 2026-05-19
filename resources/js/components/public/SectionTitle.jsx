import React from "react";

export default function SectionTitle({ eyebrow, title, text, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? <p className="public-eyebrow mb-3 text-sm font-bold uppercase">{eyebrow}</p> : null}
      <h2 className="public-heading mb-4 text-3xl font-extrabold md:text-4xl">{title}</h2>
      {text ? <p className="public-copy leading-relaxed">{text}</p> : null}
    </div>
  );
}
