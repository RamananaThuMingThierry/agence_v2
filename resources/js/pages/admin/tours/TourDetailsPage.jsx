import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { deleteTourReview, fetchTour, updateTourReview } from "../../../api/tours";

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

function ReviewStatusBadge({ value, deletedAt }) {
  if (deletedAt) {
    return <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-700">Corbeille</span>;
  }

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${value === "publish" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{value || "publish"}</span>;
}

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className={filled ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 fill-stone-200 text-stone-200"} aria-hidden="true">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function StarRating({ value = 5 }) {
  const count = Math.max(1, Math.min(5, Number(value || 0)));

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => <StarIcon key={star} filled={star <= count} />)}
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmText, loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" onClick={onCancel} disabled={loading}>Annuler</button>
          <button type="button" className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" onClick={onConfirm} disabled={loading}>{loading ? "Traitement..." : confirmText}</button>
        </div>
      </div>
    </div>
  );
}

function ReviewStatusModal({ open, review, loading, onCancel, onConfirm }) {
  const [status, setStatus] = useState("publish");

  useEffect(() => {
    if (!open || !review) return;
    setStatus(review.status || "publish");
  }, [open, review]);

  if (!open || !review) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded border border-stone-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">Modifier le statut</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">Changez le statut de publication pour l'avis de "{review.name}".</p>
        </div>
        <label className="block space-y-2">
          <span className="block text-sm font-bold text-slate-800">Statut</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={loading} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400 disabled:cursor-not-allowed disabled:opacity-60">
            <option value="publish">Publie</option>
            <option value="archived">Archive</option>
          </select>
        </label>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" onClick={onCancel} disabled={loading}>Annuler</button>
          <button type="button" className="inline-flex items-center justify-center rounded-sm bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => onConfirm(status)} disabled={loading}>{loading ? "Enregistrement..." : "Mettre a jour"}</button>
        </div>
      </div>
    </div>
  );
}

export default function TourDetailsPage() {
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewStatusModal, setReviewStatusModal] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    loadTour();
  }, [tourId]);

  async function loadTour() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchTour(tourId);
      setTour(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de charger les details du tour.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewStatusUpdate(nextStatus) {
    if (!reviewStatusModal || !tour?.encrypted_id) return;

    setActionLoading(true);
    setError("");

    try {
      const updated = await updateTourReview(tour.encrypted_id, reviewStatusModal.id, { status: nextStatus });
      setTour((current) => current ? ({
        ...current,
        reviews: (current.reviews || []).map((review) => review.id === reviewStatusModal.id ? { ...review, ...updated } : review),
      }) : current);
      setReviewStatusModal(null);
      setNotice("Statut du review mis a jour.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de modifier le statut du review.");
    } finally {
      setActionLoading(false);
    }
  }

  function openDeleteReview(review) {
    setConfirmState({
      review,
      title: "Supprimer le review",
      message: `Voulez-vous supprimer l'avis de "${review.name}" ?`,
      confirmText: "Oui, supprimer",
    });
  }

  async function handleDeleteReview() {
    if (!confirmState?.review || !tour?.encrypted_id) return;

    setActionLoading(true);
    setError("");

    try {
      await deleteTourReview(tour.encrypted_id, confirmState.review.id);
      setTour((current) => current ? ({
        ...current,
        reviews: (current.reviews || []).filter((review) => review.id !== confirmState.review.id),
      }) : current);
      setConfirmState(null);
      setNotice("Review supprime.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de supprimer le review.");
    } finally {
      setActionLoading(false);
    }
  }

  const cover = useMemo(() => tour?.images?.find((image) => image.is_cover) || tour?.images?.[0] || null, [tour]);

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">Chargement du tour...</div>;
  }

  if (error && !tour) {
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

      {notice ? <div className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</div> : null}
      {error ? <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

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

      <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-6 py-5">
          <h3 className="text-lg font-extrabold text-slate-950">Reviews du tour</h3>
        </div>
        <div className="space-y-4 px-6 py-6">
          {(tour?.reviews || []).length === 0 ? (
            <p className="text-sm text-slate-500">Aucun avis associe a ce tour.</p>
          ) : tour.reviews.map((review) => (
            <article key={review.id} className="rounded-sm border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-start gap-4">
                <img src={buildImageUrl(review.image)} alt={review.name || "Voyageur"} className="h-14 w-14 rounded-full object-cover" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold text-slate-950">{review.name || "Voyageur"}</p>
                      <p className="mt-1 text-xs text-slate-500">{review.created_at ? new Date(review.created_at).toLocaleString("fr-FR") : "-"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StarRating value={review.rating} />
                      <ReviewStatusBadge value={review.status} deletedAt={review.deleted_at} />
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-slate-700">{review.review || "-"}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={() => setReviewStatusModal(review)} className="rounded-sm border px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-black hover:text-white">Modifier</button>
                    <button type="button" onClick={() => openDeleteReview(review)} className="rounded-sm border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-red-600 hover:text-white">Supprimer</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ConfirmModal open={Boolean(confirmState)} title={confirmState?.title || ""} message={confirmState?.message || ""} confirmText={confirmState?.confirmText || "Confirmer"} loading={actionLoading} onCancel={() => (actionLoading ? undefined : setConfirmState(null))} onConfirm={handleDeleteReview} />
      <ReviewStatusModal open={Boolean(reviewStatusModal)} review={reviewStatusModal} loading={actionLoading} onCancel={() => (actionLoading ? undefined : setReviewStatusModal(null))} onConfirm={handleReviewStatusUpdate} />
    </div>
  );
}
