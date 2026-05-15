import React from "react";

export default function Footer() {
  return (
    <footer className="mt-8 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] px-5 py-4 text-sm text-[var(--muted)] shadow-[var(--shadow)] backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>World of Madagascar admin panel.</p>
        <p>Responsive workspace for slides, tours, testimonials and gallery management.</p>
      </div>
    </footer>
  );
}
