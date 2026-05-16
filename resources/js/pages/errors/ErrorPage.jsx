import React from "react";
import { Link, useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";

function getErrorState(error) {
  if (isRouteErrorResponse(error)) {
    return {
      status: error.status,
      title: error.status === 404 ? "Page introuvable" : error.status === 401 ? "Acces refuse" : error.status === 403 ? "Action interdite" : error.status >= 500 ? "Erreur serveur" : "Erreur inattendue",
      message:
        typeof error.data?.message === "string"
          ? error.data.message
          : error.statusText || "Une erreur inattendue est survenue.",
    };
  }

  return {
    status: 500,
    title: "Erreur application",
    message: error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
  };
}

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();
  const state = getErrorState(error);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
        <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <section className="rounded-[1.75rem] bg-[linear-gradient(160deg,#5a2318,#0f172a)] p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">Erreur</p>
            <p className="mt-6 text-6xl font-black leading-none sm:text-7xl">{state.status}</p>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
              Si le probleme persiste, verifiez la route demandee ou rechargez l'application.
            </p>
          </section>

          <section>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent-dark)]">System Status</p>
            <h1 className="mt-4 text-3xl font-black text-[var(--ink)] sm:text-4xl">{state.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">{state.message}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-white/80 px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent-dark)]"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--line)] bg-white/80 px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent-dark)]"
              >
                Recharger
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-dark)]"
              >
                Retour accueil
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
