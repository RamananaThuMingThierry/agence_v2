import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchActivityLogs } from "../../api/activityLogs";
import { fetchBookings } from "../../api/bookings";
import { fetchContactForms } from "../../api/contactForms";
import { fetchGalleries } from "../../api/galleries";
import { fetchSlides } from "../../api/slides";
import { fetchTours } from "../../api/tours";
import { fetchUsers } from "../../api/users";

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

function DashboardCard({ label, value, tone = "default", help }) {
  const tones = {
    default: "bg-white border-stone-200 text-slate-950",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-950",
    amber: "bg-amber-50 border-amber-200 text-amber-950",
    sky: "bg-sky-50 border-sky-200 text-sky-950",
    rose: "bg-rose-50 border-rose-200 text-rose-950",
  };

  return (
    <div className={cn("rounded-sm border px-5 py-4 shadow-sm", tones[tone] || tones.default)}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
      {help ? <p className="mt-2 text-sm text-slate-500">{help}</p> : null}
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-sm border border-dashed border-stone-300 bg-white/80 px-6 py-10 text-center shadow-sm">
      <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

function SectionCard({ title, description, action, children }) {
  return (
    <section className="overflow-hidden rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-slate-950">{title}</h3>
          {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StatusBadge({ value }) {
  const styles = {
    booked: "bg-sky-100 text-sky-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-rose-100 text-rose-700",
    active: "bg-emerald-100 text-emerald-700",
    publish: "bg-emerald-100 text-emerald-700",
    inactive: "bg-slate-100 text-slate-700",
    draft: "bg-amber-100 text-amber-700",
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]", styles[value] || "bg-slate-100 text-slate-700")}>
      {value || "-"}
    </span>
  );
}

function ActionLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-black hover:text-white">
      {children}
    </Link>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR");
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR");
}

function sortByNewest(items) {
  return [...items].sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0));
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [contactForms, setContactForms] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [slides, setSlides] = useState([]);
  const [tours, setTours] = useState([]);
  const [galleries, setGalleries] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [bookingsData, contactFormsData, logsData, usersData, slidesData, toursData, galleriesData] = await Promise.all([
        fetchBookings(),
        fetchContactForms(),
        fetchActivityLogs({ per_page: 6, page: 1 }),
        fetchUsers(),
        fetchSlides(),
        fetchTours(),
        fetchGalleries(),
      ]);

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setContactForms(Array.isArray(contactFormsData) ? contactFormsData : []);
      setLogs(Array.isArray(logsData?.items) ? logsData.items : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setSlides(Array.isArray(slidesData) ? slidesData : []);
      setTours(Array.isArray(toursData) ? toursData : []);
      setGalleries(Array.isArray(galleriesData) ? galleriesData : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de charger le tableau de bord.");
      setBookings([]);
      setContactForms([]);
      setLogs([]);
      setUsers([]);
      setSlides([]);
      setTours([]);
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const booked = bookings.filter((item) => item.status === "booked").length;
    const completed = bookings.filter((item) => item.status === "completed").length;
    const cancelled = bookings.filter((item) => item.status === "cancelled").length;
    const activeSlides = slides.filter((item) => item.is_active).length;
    const publishedTours = tours.filter((item) => item.status === "active").length;
    const publishedGalleries = galleries.filter((item) => item.status === "publish").length;

    return {
      bookings: bookings.length,
      booked,
      completed,
      cancelled,
      contactForms: contactForms.length,
      users: users.length,
      slides: slides.length,
      activeSlides,
      tours: tours.length,
      publishedTours,
      galleries: galleries.length,
      publishedGalleries,
    };
  }, [bookings, contactForms, users, slides, tours, galleries]);

  const recentBookings = useMemo(() => sortByNewest(bookings).slice(0, 5), [bookings]);
  const recentContactForms = useMemo(() => sortByNewest(contactForms).slice(0, 5), [contactForms]);
  const recentLogs = useMemo(() => sortByNewest(logs).slice(0, 6), [logs]);

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-950">Tableau de bord</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Vue d'ensemble des reservations, demandes de contact, contenus publics et activites recentes.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-800"
          >
            Rafraichir
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Reservations" value={stats.bookings} tone="emerald" help={`${stats.booked} en attente, ${stats.completed} terminees`} />
        <DashboardCard label="Contact Forms" value={stats.contactForms} tone="amber" help="Demandes recues depuis le site public" />
        <DashboardCard label="Utilisateurs" value={stats.users} tone="sky" help="Comptes admin et equipe" />
        <DashboardCard label="Activity Logs" value={recentLogs.length} tone="rose" help="Dernieres activites chargees" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard label="Slides" value={stats.slides} help={`${stats.activeSlides} actifs`} />
        <DashboardCard label="Tours" value={stats.tours} help={`${stats.publishedTours} actifs/publies`} />
        <DashboardCard label="Galeries" value={stats.galleries} help={`${stats.publishedGalleries} publiees`} />
      </div>

      <SectionCard
        title="Acces rapides"
        description="Raccourcis vers les modules admin les plus utiles."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ActionLink to="/admin/bookings">Voir les bookings</ActionLink>
          <ActionLink to="/admin/contact-forms">Voir les contacts</ActionLink>
          <ActionLink to="/admin/slides">Gerer les slides</ActionLink>
          <ActionLink to="/admin/settings">Ouvrir les settings</ActionLink>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Dernieres reservations"
          description="Les demandes de reservation les plus recentes."
          action={<ActionLink to="/admin/bookings">Tout voir</ActionLink>}
        >
          {loading ? (
            <EmptyState title="Chargement..." description="Les reservations sont en cours de recuperation." />
          ) : recentBookings.length === 0 ? (
            <EmptyState title="Aucune reservation" description="Aucun booking n'est encore disponible." />
          ) : (
            <div className="overflow-hidden rounded-sm border border-stone-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50 text-left">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Client</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Circuit</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Date</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Statut</th>
                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {recentBookings.map((booking) => (
                      <tr key={booking.encrypted_id || booking.id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-extrabold text-slate-950">{booking.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{booking.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700">{booking.tour?.title || "-"}</td>
                        <td className="px-5 py-4 text-sm text-slate-500">{formatDate(booking.created_at)}</td>
                        <td className="px-5 py-4"><StatusBadge value={booking.status} /></td>
                        <td className="px-5 py-4 text-right">
                          <Link to={`/admin/bookings/${booking.encrypted_id}`} className="text-sm font-bold text-slate-700 transition hover:text-black">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Dernieres demandes de contact"
          description="Messages recus via le formulaire public."
          action={<ActionLink to="/admin/contact-forms">Tout voir</ActionLink>}
        >
          {loading ? (
            <EmptyState title="Chargement..." description="Les formulaires de contact sont en cours de recuperation." />
          ) : recentContactForms.length === 0 ? (
            <EmptyState title="Aucun message" description="Aucun formulaire de contact n'est encore disponible." />
          ) : (
            <div className="space-y-3">
              {recentContactForms.map((item) => (
                <Link
                  key={item.encrypted_id || item.id}
                  to={`/admin/contact-forms/${item.encrypted_id}`}
                  className="block rounded-sm border border-stone-200 bg-stone-50 px-4 py-4 transition hover:border-stone-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-slate-950">{item.name}</p>
                      <p className="mt-1 truncate text-sm text-slate-500">{item.email}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.message || "-"}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-slate-400">{formatDate(item.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Activite recente"
        description="Derniers evenements techniques et actions admin."
        action={<ActionLink to="/admin/activity-logs">Voir les logs</ActionLink>}
      >
        {loading ? (
          <EmptyState title="Chargement..." description="Les activity logs sont en cours de recuperation." />
        ) : recentLogs.length === 0 ? (
          <EmptyState title="Aucune activite" description="Aucun log recent n'a ete trouve." />
        ) : (
          <div className="overflow-hidden rounded-sm border border-stone-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50 text-left">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Action</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Message</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Utilisateur</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {recentLogs.map((log) => (
                    <tr key={log.encrypted_id || log.id} className="align-top">
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <StatusBadge value={log.color === "success" ? "active" : log.color === "warning" ? "draft" : log.color === "danger" ? "cancelled" : "inactive"} />
                          <p className="text-sm font-bold text-slate-900">{log.action || "-"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{log.message || "-"}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        <p className="font-bold text-slate-900">{log.user?.pseudo || "Systeme"}</p>
                        <p className="mt-1 text-slate-500">{log.user?.email || "-"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">{formatDateTime(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
