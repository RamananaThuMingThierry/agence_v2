import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchTour } from "../../../api/tours";

function buildImageUrl(path) {
  if (!path) return "/images/profil.png";
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}

function StatusBadge({ value, deletedAt }) {
  if (deletedAt) {
    return <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-700">Corbeille</span>;
  }

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${value === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{value || "inactive"}</span>;
}

export default function TourDetailsPage() {
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTour() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchTour(tourId);
        if (!active) return;
        setTour(data);
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || "Impossible de charger les details du tour.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTour();

    return () => {
      active = false;
    };
  }, [tourId]);

  const cover = useMemo(() => tour?.images?.find((image) => image.is_cover) || tour?.images?.[0] || null, [tour]);

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">Chargement du tour...</div>;
  }

  if (error) {
    return <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Details du tour</h2>
            <p className="mt-2 text-sm text-slate-500">Consultation rapide du produit tour.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/tours" className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">Retour a la liste</Link>
            <Link to={`/admin/tours/${tour?.encrypted_id}/edit`} className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700">Modifier</Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
        <div className="grid gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-sm border border-stone-200 bg-stone-50"><img src={buildImageUrl(cover?.image_url)} alt={tour?.title || "Tour"} className="h-72 w-full object-cover" /></div>
            <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Cover</p><p className="mt-2 text-sm font-semibold text-slate-900">{cover?.caption || tour?.title || "-"}</p></div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailCard label="Titre" value={tour?.title} />
              <DetailCard label="Slug" value={tour?.slug} />
              <DetailCard label="Categorie" value={tour?.category} />
              <DetailCard label="Duree" value={tour?.duration} />
              <DetailCard label="Prix" value={Number(tour?.price || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} />
              <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Statut</p><div className="mt-2"><StatusBadge value={tour?.status} deletedAt={tour?.deleted_at} /></div></div>
              <DetailCard label="Depart" value={tour?.start_location} />
              <DetailCard label="Arrivee" value={tour?.end_location} />
              <DetailCard label="Creation" value={tour?.created_at ? new Date(tour.created_at).toLocaleString("fr-FR") : "-"} />
              <DetailCard label="Derniere mise a jour" value={tour?.updated_at ? new Date(tour.updated_at).toLocaleString("fr-FR") : "-"} />
            </div>
            <div className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Description</p><p className="mt-2 text-sm leading-7 text-slate-700">{tour?.description || "-"}</p></div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm"><div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">Programme</h3></div><div className="space-y-4 px-6 py-6">{(tour?.programs || []).length === 0 ? <p className="text-sm text-slate-500">Aucun programme.</p> : tour.programs.map((program) => <div key={program.encrypted_id || program.id} className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Jour {program.day_number}</p><p className="mt-2 text-sm font-bold text-slate-900">{program.title}</p><p className="mt-2 text-sm leading-7 text-slate-700">{program.description}</p>{program.activities ? <p className="mt-3 text-sm text-slate-600">Activites: {program.activities}</p> : null}</div>)}</div></section>
        <section className="space-y-6"><section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm"><div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">Inclusions</h3></div><div className="space-y-3 px-6 py-6">{(tour?.inclusions || []).length === 0 ? <p className="text-sm text-slate-500">Aucune inclusion.</p> : tour.inclusions.map((item) => <div key={item.encrypted_id || item.id} className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-slate-900">{item.description}</div>)}</div></section><section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm"><div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">Exclusions</h3></div><div className="space-y-3 px-6 py-6">{(tour?.exclusions || []).length === 0 ? <p className="text-sm text-slate-500">Aucune exclusion.</p> : tour.exclusions.map((item) => <div key={item.encrypted_id || item.id} className="rounded-sm border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-slate-900">{item.description}</div>)}</div></section></section>
      </section>

      <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm"><div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">Images du tour</h3></div><div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-3">{(tour?.images || []).map((image) => <div key={image.encrypted_id || image.id} className="overflow-hidden rounded-sm border border-stone-200 bg-stone-50"><img src={buildImageUrl(image.image_url)} alt={image.caption || tour?.title || "Tour image"} className="h-56 w-full object-cover" /><div className="space-y-3 px-4 py-4">{image.is_cover ? <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-700">Cover</span> : null}<p className="text-sm font-semibold text-slate-900">{image.caption || "Sans caption"}</p></div></div>)}</div></section>
    </div>
  );
}
