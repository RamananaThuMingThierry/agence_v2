import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchCategories } from "../../../api/categories";
import { createGallery, fetchGallery, updateGallery } from "../../../api/galleries";
import { fetchTours } from "../../../api/tours";

const initialForm = {
  title: "",
  subtitle: "",
  place: "",
  description: "",
  status: "publish",
  category_id: "",
  tour_id: "",
};

function buildImageUrl(path) {
  if (!path) return "/images/profil.png";
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

function Icon({ name, className = "h-5 w-5" }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  switch (name) {
    case "arrow-left":
      return <svg {...common}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>;
    default:
      return null;
  }
}

export default function FormGalleryPage() {
  const { galleryId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(galleryId);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [tours, setTours] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newCaptions, setNewCaptions] = useState([]);
  const [coverSelection, setCoverSelection] = useState({ type: "new", value: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [categoryItems, tourItems, gallery] = await Promise.all([
          fetchCategories(),
          fetchTours(),
          isEditMode ? fetchGallery(galleryId) : Promise.resolve(null),
        ]);

        if (!active) return;

        setCategories(categoryItems);
        setTours(Array.isArray(tourItems) ? tourItems : []);

        if (gallery) {
          setForm({
            title: gallery.title || "",
            subtitle: gallery.subtitle || "",
            place: gallery.place || "",
            description: gallery.description || "",
            status: gallery.status || "publish",
            category_id: String(gallery.category_id || ""),
            tour_id: gallery.tour_id ? String(gallery.tour_id) : "",
          });
          const images = Array.isArray(gallery.images) ? gallery.images : [];
          setExistingImages(images);
          const cover = images.find((image) => image.is_cover) || images[0] || null;
          setCoverSelection(cover ? { type: "existing", value: cover.id } : { type: "new", value: 0 });
        }
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || "Impossible de charger la gallery.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [galleryId, isEditMode]);

  const newPreviews = useMemo(() => newImages.map((file) => (file instanceof File ? URL.createObjectURL(file) : "")), [newImages]);

  useEffect(() => () => {
    newPreviews.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  }, [newPreviews]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleExistingCaptionChange(imageId, caption) {
    setExistingImages((current) => current.map((image) => (image.id === imageId ? { ...image, caption } : image)));
  }

  function handleNewCaptionChange(index, caption) {
    setNewCaptions((current) => current.map((value, itemIndex) => (itemIndex === index ? caption : value)));
  }

  function handleFilesChange(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setNewImages((current) => [...current, ...files]);
    setNewCaptions((current) => [...current, ...files.map(() => "")]);

    if (existingImages.length === 0 && newImages.length === 0) {
      setCoverSelection({ type: "new", value: 0 });
    }

    event.target.value = "";
  }

  function removeExistingImage(imageId) {
    setExistingImages((current) => current.filter((image) => image.id !== imageId));
    setRemovedImageIds((current) => [...current, imageId]);

    if (coverSelection.type === "existing" && coverSelection.value === imageId) {
      setCoverSelection(() => {
        const fallbackExisting = existingImages.filter((image) => image.id !== imageId)[0];
        if (fallbackExisting) return { type: "existing", value: fallbackExisting.id };
        return { type: "new", value: 0 };
      });
    }
  }

  function removeNewImage(index) {
    setNewImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setNewCaptions((current) => current.filter((_, itemIndex) => itemIndex !== index));

    setCoverSelection((current) => {
      if (current.type !== "new") return current;
      if (current.value === index) {
        if (existingImages.length > 0) return { type: "existing", value: existingImages[0].id };
        return { type: "new", value: 0 };
      }
      if (current.value > index) return { ...current, value: current.value - 1 };
      return current;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (existingImages.length + newImages.length === 0) {
      setError("Ajoutez au moins une image pour la gallery.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...form,
        existingImages,
        removedImageIds,
        newImages,
        newCaptions,
        coverSelection,
      };

      if (isEditMode) {
        await updateGallery(galleryId, payload);
      } else {
        await createGallery(payload);
      }

      navigate("/admin/galleries", {
        replace: true,
        state: {
          notice: isEditMode ? "Gallery mise a jour." : "Gallery creee.",
        },
      });
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || "Echec de l'enregistrement de la gallery.");
      } else {
        setError(requestError.response?.data?.message || "Echec de l'enregistrement de la gallery.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">Chargement de la gallery...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">{isEditMode ? "Modifier la gallery" : "Ajouter une gallery"}</h2>
            <p className="mt-2 text-sm text-slate-500">Configurez les informations de la gallery et sa collection d'images.</p>
          </div>

          <Link to="/admin/galleries" className="inline-flex items-center justify-center gap-2 self-start rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black">
            <Icon name="arrow-left" className="h-4 w-4" />
            Retour a la liste
          </Link>
        </div>
      </section>

      {error ? <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Titre</span>
                <input type="text" name="title" required value={form.title} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder="Titre de la gallery" />
              </label>

              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Sous-titre</span>
                <input type="text" name="subtitle" value={form.subtitle} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder="Sous-titre" />
              </label>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Lieu</span>
                <input type="text" name="place" value={form.place} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder="Ex: Morondava" />
              </label>

              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Categorie</span>
                <select name="category_id" required value={form.category_id} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400">
                  <option value="">Selectionner une categorie</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Circuit lie</span>
                <select name="tour_id" value={form.tour_id} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400">
                  <option value="">Aucun circuit lie</option>
                  {tours.map((tour) => <option key={tour.id} value={tour.id}>{tour.title}</option>)}
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Statut</span>
                <select name="status" required value={form.status} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400">
                  <option value="publish">Publie</option>
                  <option value="draft">Brouillon</option>
                </select>
              </label>
            </div>

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">Description</span>
              <textarea name="description" rows="6" value={form.description} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder="Description de la gallery" />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">Ajouter des images</span>
              <input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={handleFilesChange} className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white" />
            </label>
          </div>

          <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link to="/admin/galleries" className="inline-flex w-full items-center justify-center rounded-sm border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition sm:w-auto">Annuler</Link>
              <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{saving ? "Enregistrement..." : isEditMode ? "Mettre a jour" : "Enregistrer"}</button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-6 py-5">
              <h3 className="text-lg font-extrabold text-slate-950">Images existantes</h3>
              <p className="mt-2 text-sm text-slate-500">Modifiez les captions, choisissez la cover ou retirez des images.</p>
            </div>
            <div className="space-y-4 px-6 py-6">
              {existingImages.length === 0 ? <p className="text-sm text-slate-500">Aucune image existante.</p> : existingImages.map((image) => (
                <div key={image.id} className="rounded-sm border border-stone-200 p-4">
                  <div className="flex gap-4">
                    <img src={buildImageUrl(image.image_url)} alt={image.caption || form.title || "Gallery"} className="h-24 w-24 rounded-sm object-cover" />
                    <div className="min-w-0 flex-1 space-y-3">
                      <label className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Caption</span>
                        <input type="text" value={image.caption || ""} onChange={(event) => handleExistingCaptionChange(image.id, event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder="Caption de l'image" />
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <input type="radio" name="cover-selection" checked={coverSelection.type === "existing" && coverSelection.value === image.id} onChange={() => setCoverSelection({ type: "existing", value: image.id })} />
                          Cover
                        </label>
                        <button type="button" onClick={() => removeExistingImage(image.id)} className="text-sm font-bold text-rose-700 transition hover:text-rose-900">Retirer</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-6 py-5">
              <h3 className="text-lg font-extrabold text-slate-950">Nouvelles images</h3>
              <p className="mt-2 text-sm text-slate-500">Previsualisez les nouvelles images avant enregistrement.</p>
            </div>
            <div className="space-y-4 px-6 py-6">
              {newImages.length === 0 ? <p className="text-sm text-slate-500">Aucune nouvelle image selectionnee.</p> : newImages.map((file, index) => (
                <div key={`${file.name}-${index}`} className="rounded-sm border border-stone-200 p-4">
                  <div className="flex gap-4">
                    <img src={newPreviews[index]} alt={file.name} className="h-24 w-24 rounded-sm object-cover" />
                    <div className="min-w-0 flex-1 space-y-3">
                      <p className="truncate text-sm font-bold text-slate-900">{file.name}</p>
                      <label className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Caption</span>
                        <input type="text" value={newCaptions[index] || ""} onChange={(event) => handleNewCaptionChange(index, event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder="Caption de l'image" />
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <input type="radio" name="cover-selection" checked={coverSelection.type === "new" && coverSelection.value === index} onChange={() => setCoverSelection({ type: "new", value: index })} />
                          Cover
                        </label>
                        <button type="button" onClick={() => removeNewImage(index)} className="text-sm font-bold text-rose-700 transition hover:text-rose-900">Retirer</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
