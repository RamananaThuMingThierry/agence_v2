import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
        <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <section className="rounded-[1.75rem] bg-[linear-gradient(160deg,#17362f,#0f172a)] p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">404</p>
            <p className="mt-6 text-6xl font-black leading-none sm:text-7xl">Page</p>
            <p className="mt-3 text-4xl font-black leading-none sm:text-5xl">Introuvable</p>
          </section>

          <section>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent-dark)]">Route introuvable</p>
            <h1 className="mt-4 text-3xl font-black text-[var(--ink)] sm:text-4xl">Cette page n'existe pas ou plus.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Verifiez l'adresse saisie ou revenez vers une section connue du site ou de l'administration.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-white/80 px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent-dark)]"
              >
                Retour
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-dark)]"
              >
                Accueil
              </Link>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-white/80 px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent-dark)]"
              >
                Admin
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
