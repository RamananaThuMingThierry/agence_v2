import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const initialForm = {
  title: "",
  subtitle: "",
  description: "",
  order: 0,
  image: null,
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SlideCard({ slide, onEdit, onDelete, onRestore, onForceDelete }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur">
      <div className="relative h-56 overflow-hidden bg-[var(--bg-strong)]">
        {slide.image ? (
          <img
            src={`/${slide.image}`}
            alt={slide.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">Aucune image</div>
        )}
        <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
          Ordre {slide.order}
        </div>
        {slide.deleted_at && (
          <div className="absolute right-4 top-4 rounded-full bg-[var(--danger)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Corbeille
          </div>
        )}
      </div>
      <div className="space-y-4 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-dark)]">Slide</p>
          <h3 className="mt-2 text-2xl font-black leading-tight text-[var(--ink)]">{slide.title}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">{slide.subtitle || "Sans sous-titre"}</p>
        </div>
        <p className="min-h-[4.5rem] text-sm leading-6 text-[var(--muted)]">{slide.description || "Aucune description pour le moment."}</p>
        <div className="flex flex-wrap gap-3">
          {!slide.deleted_at && (
            <>
              <button onClick={() => onEdit(slide)} className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                Modifier
              </button>
              <button onClick={() => onDelete(slide)} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-white/60">
                Supprimer
              </button>
            </>
          )}
          {slide.deleted_at && (
            <>
              <button onClick={() => onRestore(slide)} className="rounded-full bg-[var(--success)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                Restaurer
              </button>
              <button onClick={() => onForceDelete(slide)} className="rounded-full border border-[var(--danger)] px-4 py-2 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger)] hover:text-white">
                Supprimer définitivement
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default function SlidesPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showTrashed, setShowTrashed] = useState(false);
  const [onlyTrashed, setOnlyTrashed] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    fetchSlides();
  }, [showTrashed, onlyTrashed]);

  async function fetchSlides() {
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get("/api/slides", {
        params: {
          with_trashed: showTrashed,
          only_trashed: onlyTrashed,
        },
      });

      setSlides(Array.isArray(data.data) ? data.data : data.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les slides.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingSlide(null);
    setForm(initialForm);
    setPreview("");
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function handleEdit(slide) {
    setEditingSlide(slide);
    setForm({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      description: slide.description || "",
      order: slide.order ?? 0,
      image: null,
    });
    setPreview(slide.image ? `/${slide.image}` : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleChange(event) {
    const { name, value, files } = event.target;

    if (name === "image") {
      const file = files?.[0] || null;
      setForm((current) => ({ ...current, image: file }));
      setPreview(file ? URL.createObjectURL(file) : editingSlide?.image ? `/${editingSlide.image}` : "");
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: name === "order" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("subtitle", form.subtitle);
    payload.append("description", form.description);
    payload.append("order", String(form.order ?? 0));
    if (form.image) {
      payload.append("image", form.image);
    }

    try {
      if (editingSlide?.encrypted_id) {
        payload.append("_method", "PUT");
        await axios.post(`/api/slides/${editingSlide.encrypted_id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setNotice("Slide mis à jour.");
      } else {
        await axios.post("/api/slides", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setNotice("Slide créé.");
      }

      resetForm();
      await fetchSlides();
    } catch (err) {
      setError(err.response?.data?.message || "Échec de l’enregistrement du slide.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slide) {
    if (!window.confirm(`Supprimer le slide "${slide.title}" ?`)) {
      return;
    }

    try {
      await axios.delete(`/api/slides/${slide.encrypted_id}`);
      setNotice("Slide déplacé dans la corbeille.");
      await fetchSlides();
    } catch (err) {
      setError(err.response?.data?.message || "Échec de la suppression du slide.");
    }
  }

  async function handleRestore(slide) {
    try {
      await axios.post(`/api/slides/${slide.encrypted_id}/restore`);
      setNotice("Slide restauré.");
      await fetchSlides();
    } catch (err) {
      setError(err.response?.data?.message || "Échec de la restauration du slide.");
    }
  }

  async function handleForceDelete(slide) {
    if (!window.confirm(`Supprimer définitivement "${slide.title}" et son image ?`)) {
      return;
    }

    try {
      await axios.delete(`/api/slides/${slide.encrypted_id}/force`);
      setNotice("Slide supprimé définitivement.");
      await fetchSlides();
    } catch (err) {
      setError(err.response?.data?.message || "Échec de la suppression définitive du slide.");
    }
  }

  const activeCount = slides.filter((slide) => !slide.deleted_at).length;
  const trashedCount = slides.filter((slide) => slide.deleted_at).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2.2rem] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--accent-dark)]">Agence Interface</p>
              <h2 className="mt-4 text-5xl font-black uppercase leading-none tracking-[-0.04em] text-[var(--ink)] sm:text-6xl">
                Slides Editor
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
                Une interface React pensée pour piloter les visuels d’accueil, gérer la corbeille et maintenir l’ordre d’affichage sans quitter le back-office.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:min-w-[320px]">
              <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Actifs</p>
                <p className="mt-2 text-4xl font-black text-[var(--ink)]">{activeCount}</p>
              </div>
              <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Corbeille</p>
                <p className="mt-2 text-4xl font-black text-[var(--ink)]">{trashedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setShowTrashed(false);
              setOnlyTrashed(false);
            }}
            className={classNames(
              "rounded-full px-5 py-3 text-sm font-semibold transition",
              !showTrashed && !onlyTrashed
                ? "bg-[var(--ink)] text-white"
                : "border border-[var(--line)] bg-white/60 text-[var(--ink)] hover:bg-white"
            )}
          >
            Actifs
          </button>
          <button
            onClick={() => {
              setShowTrashed(true);
              setOnlyTrashed(false);
            }}
            className={classNames(
              "rounded-full px-5 py-3 text-sm font-semibold transition",
              showTrashed && !onlyTrashed
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--line)] bg-white/60 text-[var(--ink)] hover:bg-white"
            )}
          >
            Tous
          </button>
          <button
            onClick={() => {
              setShowTrashed(true);
              setOnlyTrashed(true);
            }}
            className={classNames(
              "rounded-full px-5 py-3 text-sm font-semibold transition",
              onlyTrashed
                ? "bg-[var(--danger)] text-white"
                : "border border-[var(--line)] bg-white/60 text-[var(--ink)] hover:bg-white"
            )}
          >
            Corbeille
          </button>
          <button onClick={fetchSlides} className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-white">
            Rafraîchir
          </button>
        </div>

        {notice && <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">{notice}</div>}
        {error && <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">{error}</div>}

        {loading ? (
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-sm text-[var(--muted)] shadow-[var(--shadow)]">
            Chargement des slides...
          </div>
        ) : slides.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-10 text-center shadow-[var(--shadow)]">
            <p className="text-lg font-semibold text-[var(--ink)]">Aucun slide à afficher.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Crée ton premier slide depuis le panneau à droite.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {slides.map((slide) => (
              <SlideCard
                key={slide.encrypted_id || slide.id}
                slide={slide}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onForceDelete={handleForceDelete}
              />
            ))}
          </div>
        )}
      </section>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="overflow-hidden rounded-[2.2rem] border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[var(--shadow)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent-dark)]">
                {editingSlide ? "Mode édition" : "Nouveau slide"}
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-[var(--ink)]">
                {editingSlide ? editingSlide.title : "Composer un slide"}
              </h2>
            </div>
            {editingSlide && (
              <button onClick={resetForm} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-white/70">
                Annuler
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--ink)]">Titre</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                placeholder="Escapade atlas"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--ink)]">Sous-titre</span>
              <input
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                placeholder="Voyages signature"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-[1fr_124px]">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--ink)]">Image</span>
                <input
                  ref={fileRef}
                  type="file"
                  name="image"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:font-semibold file:text-white"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--ink)]">Ordre</span>
                <input
                  type="number"
                  min="0"
                  name="order"
                  value={form.order}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--ink)]">Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                className="w-full rounded-3xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                placeholder="Texte éditorial pour le hero d’accueil."
              />
            </label>

            <div className="overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-strong)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                <p className="text-sm font-semibold text-[var(--ink)]">Prévisualisation</p>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Hero media</p>
              </div>
              <div className="p-4">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-56 w-full rounded-[1.3rem] object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-[1.3rem] border border-dashed border-[var(--line)] bg-white/60 text-sm text-[var(--muted)]">
                    Aucune image sélectionnée
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-[var(--accent)] px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : editingSlide ? "Mettre à jour le slide" : "Créer le slide"}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
