import React from "react";
import { NavLink, Outlet } from "react-router-dom";

function navClass({ isActive }) {
  return [
    "rounded-full px-4 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-[var(--accent)] text-white"
      : "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--ink)]",
  ].join(" ");
}

export default function AdminLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent-dark)]">Back Office</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">Agence Control Room</h1>
        </div>
        <nav className="flex flex-wrap gap-3">
          <NavLink to="/admin/slides" className={navClass}>
            Slides
          </NavLink>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}
