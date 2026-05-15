import React from "react";

export default function Header({ user, onOpenSidebar }) {
  return (
    <header className="mb-6 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent-dark)]">Back Office</p>
            <h1 className="mt-3 text-3xl font-black uppercase tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Gerer slides, tours, testimonials, gallery et les futurs modules depuis une interface unique.
            </p>
          </div>

          <button
            onClick={onOpenSidebar}
            className="rounded-full border border-[var(--line)] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink)] lg:hidden"
          >
            Menu
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
          <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Account</p>
            <p className="mt-2 text-base font-bold text-[var(--ink)]">{user?.pseudo || user?.email}</p>
          </div>
          <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Role</p>
            <p className="mt-2 text-base font-bold text-[var(--ink)]">{user?.role || "admin"}</p>
          </div>
          <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Status</p>
            <p className="mt-2 text-base font-bold text-[var(--ink)]">{user?.status || "active"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
