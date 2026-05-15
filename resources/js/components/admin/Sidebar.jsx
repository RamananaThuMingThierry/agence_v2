import React from "react";
import { NavLink } from "react-router-dom";
import { adminNavigation } from "../../data/adminNavigation";

function linkClass({ isActive }) {
  return [
    "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
    isActive
      ? "bg-[var(--ink)] text-white shadow-lg"
      : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]",
  ].join(" ");
}

export default function Sidebar({ user, onLogout, onClose }) {
  return (
    <div className="flex h-full flex-col rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent-dark)]">Admin</p>
          <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">World of Madagascar</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Control room for site content.</p>
        </div>
        {onClose ? (
          <button
            onClick={onClose}
            className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)] lg:hidden"
          >
            Close
          </button>
        ) : null}
      </div>

      <div className="mt-5 rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-dark)]">Session</p>
        <p className="mt-3 text-lg font-bold text-[var(--ink)]">{user?.pseudo || user?.email}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{user?.role === "admin" ? "Administrator" : "Operator"}</p>
      </div>

      <nav className="mt-6 flex-1 space-y-2">
        {adminNavigation.map((item) => (
          <NavLink key={`${item.label}-${item.badge}`} to={item.href} className={linkClass} onClick={onClose}>
            <span>{item.label}</span>
            <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              {item.badge}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-[var(--line)] pt-5">
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center rounded-full border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
