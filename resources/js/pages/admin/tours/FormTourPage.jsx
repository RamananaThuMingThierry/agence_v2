import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../../../hooks/admin/I18nContext";
import { createTour, fetchTour, updateTour } from "../../../api/tours";

const initialForm = {
  title: "",
  description: "",
  slug: "",
  price: "",
  duration: "",
  category: "",
  start_location: "",
  end_location: "",
  status: "inactive",
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

export default function FormTourPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const isEditMode = Boolean(tourId);
  const [form, setForm] = useState(initialForm);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newCaptions, setNewCaptions] = useState([]);
  const [coverSelection, setCoverSelection] = useState({ type: "new", value: 0 });
  const [programs, setPrograms] = useState([{ day_number: 1, title: "", description: "", activities: "" }]);
  const [inclusions, setInclusions] = useState([""]);
  const [exclusions, setExclusions] = useState([""]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTour() {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const tour = await fetchTour(tourId);
        if (!active) return;

        setForm({
          title: tour?.title || "",
          description: tour?.description || "",
          slug: tour?.slug || "",
          price: tour?.price ?? "",
          duration: tour?.duration || "",
          category: tour?.category || "",
          start_location: tour?.start_location || "",
          end_location: tour?.end_location || "",
          status: tour?.status || "inactive",
        });

        const images = Array.isArray(tour?.images) ? tour.images : [];
        setExistingImages(images);
        const cover = images.find((image) => image.is_cover) || images[0] || null;
        setCoverSelection(cover ? { type: "existing", value: cover.id } : { type: "new", value: 0 });

        setPrograms(Array.isArray(tour?.programs) && tour.programs.length > 0 ? tour.programs.map((program) => ({ day_number: program.day_number ?? 1, title: program.title || "", description: program.description || "", activities: program.activities || "" })) : [{ day_number: 1, title: "", description: "", activities: "" }]);
        setInclusions(Array.isArray(tour?.inclusions) && tour.inclusions.length > 0 ? tour.inclusions.map((item) => item.description || "") : [""]);
        setExclusions(Array.isArray(tour?.exclusions) && tour.exclusions.length > 0 ? tour.exclusions.map((item) => item.description || "") : [""]);
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.message || t("tours.form.load_error"));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTour();

    return () => {
      active = false;
    };
  }, [isEditMode, t, tourId]);

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

  function handleFilesChange(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setNewImages((current) => [...current, ...files]);
    setNewCaptions((current) => [...current, ...files.map(() => "")]);
    if (existingImages.length === 0 && newImages.length === 0) setCoverSelection({ type: "new", value: 0 });
    event.target.value = "";
  }

  function handleExistingCaptionChange(imageId, caption) {
    setExistingImages((current) => current.map((image) => (image.id === imageId ? { ...image, caption } : image)));
  }

  function handleNewCaptionChange(index, caption) {
    setNewCaptions((current) => current.map((value, itemIndex) => (itemIndex === index ? caption : value)));
  }

  function removeExistingImage(imageId) {
    setExistingImages((current) => current.filter((image) => image.id !== imageId));
    setRemovedImageIds((current) => [...current, imageId]);
    if (coverSelection.type === "existing" && coverSelection.value === imageId) {
      const fallbackExisting = existingImages.filter((image) => image.id !== imageId)[0];
      setCoverSelection(fallbackExisting ? { type: "existing", value: fallbackExisting.id } : { type: "new", value: 0 });
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

  function updateProgram(index, field, value) {
    setPrograms((current) => current.map((program, itemIndex) => (itemIndex === index ? { ...program, [field]: field === "day_number" ? Number(value) : value } : program)));
  }

  function addProgram() {
    setPrograms((current) => [...current, { day_number: current.length + 1, title: "", description: "", activities: "" }]);
  }

  function removeProgram(index) {
    setPrograms((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateSimpleList(setter, index, value) {
    setter((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function addSimpleListItem(setter) {
    setter((current) => [...current, ""]);
  }

  function removeSimpleListItem(setter, index) {
    setter((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (existingImages.length + newImages.length === 0) {
      setError(t("tours.form.image_required"));
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
        programs: programs.filter((program) => program.title || program.description || program.activities),
        inclusions: inclusions.filter((item) => item && item.trim() !== ""),
        exclusions: exclusions.filter((item) => item && item.trim() !== ""),
      };

      if (isEditMode) {
        await updateTour(tourId, payload);
      } else {
        await createTour(payload);
      }

      navigate("/admin/tours", {
        replace: true,
        state: {
          notice: isEditMode ? t("tours.form.update_success") : t("tours.form.create_success"),
        },
      });
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || t("tours.form.save_error"));
      } else {
        setError(requestError.response?.data?.message || t("tours.form.save_error"));
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">{t("tours.form.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">{isEditMode ? t("tours.form.edit_title") : t("tours.form.create_title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("tours.form.description")}</p>
          </div>
          <Link to="/admin/tours" className="inline-flex items-center justify-center gap-2 self-start rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black"><Icon name="arrow-left" className="h-4 w-4" />{t("tours.common.back")}</Link>
        </div>
      </section>

      {error ? <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <section className="space-y-6">
          <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-2"><span className="block text-sm font-bold text-slate-800">{t("tours.form.fields.title")}</span><input type="text" name="title" required value={form.title} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label>
                <label className="space-y-2"><span className="block text-sm font-bold text-slate-800">{t("tours.form.fields.slug")}</span><input type="text" name="slug" value={form.slug} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" placeholder={t("tours.form.fields.slug_placeholder")} /></label>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-2"><span className="block text-sm font-bold text-slate-800">{t("tours.form.fields.price")}</span><input type="number" min="0" step="0.01" name="price" required value={form.price} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label>
                <label className="space-y-2"><span className="block text-sm font-bold text-slate-800">{t("tours.form.fields.duration")}</span><input type="text" name="duration" required value={form.duration} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-2"><span className="block text-sm font-bold text-slate-800">{t("tours.form.fields.category")}</span><input type="text" name="category" required value={form.category} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label>
                <label className="space-y-2"><span className="block text-sm font-bold text-slate-800">{t("tours.form.fields.status")}</span><select name="status" value={form.status} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"><option value="inactive">{t("tours.status.inactive")}</option><option value="active">{t("tours.status.active")}</option></select></label>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-2"><span className="block text-sm font-bold text-slate-800">{t("tours.form.fields.start_location")}</span><input type="text" name="start_location" value={form.start_location} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label>
                <label className="space-y-2"><span className="block text-sm font-bold text-slate-800">{t("tours.form.fields.end_location")}</span><input type="text" name="end_location" value={form.end_location} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label>
              </div>
              <label className="space-y-2"><span className="block text-sm font-bold text-slate-800">{t("tours.form.fields.description")}</span><textarea name="description" rows="8" value={form.description} onChange={handleChange} className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label>
            </div>
          </section>

          <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">{t("tours.form.program.title")}</h3></div>
            <div className="space-y-4 px-6 py-6">{programs.map((program, index) => <div key={`program-${index}`} className="rounded-sm border border-stone-200 p-4"><div className="grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)]"><label className="space-y-2"><span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("tours.form.program.day")}</span><input type="number" min="1" value={program.day_number} onChange={(event) => updateProgram(index, "day_number", event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label><div className="space-y-4"><label className="space-y-2"><span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("tours.form.program.item_title")}</span><input type="text" value={program.title} onChange={(event) => updateProgram(index, "title", event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label><label className="space-y-2"><span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("tours.form.program.item_description")}</span><textarea rows="4" value={program.description} onChange={(event) => updateProgram(index, "description", event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label><label className="space-y-2"><span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("tours.form.program.activities")}</span><textarea rows="3" value={program.activities} onChange={(event) => updateProgram(index, "activities", event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label></div></div>{programs.length > 1 ? <button type="button" onClick={() => removeProgram(index)} className="mt-4 text-sm font-bold text-rose-700 transition hover:text-rose-900">{t("tours.form.program.remove_day")}</button> : null}</div>)}<button type="button" onClick={addProgram} className="rounded-sm border border-stone-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-stone-50">{t("tours.form.program.add_day")}</button></div>
          </section>

          <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="grid gap-6 px-6 py-6 lg:grid-cols-2">
              <div className="space-y-4"><h3 className="text-lg font-extrabold text-slate-950">{t("tours.form.inclusions.title")}</h3>{inclusions.map((item, index) => <div key={`inc-${index}`} className="flex gap-2"><input type="text" value={item} onChange={(event) => updateSimpleList(setInclusions, index, event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-400" />{inclusions.length > 1 ? <button type="button" onClick={() => removeSimpleListItem(setInclusions, index)} className="rounded-sm border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700">-</button> : null}</div>)}<button type="button" onClick={() => addSimpleListItem(setInclusions)} className="rounded-sm border border-stone-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-stone-50">{t("tours.form.inclusions.add")}</button></div>
              <div className="space-y-4"><h3 className="text-lg font-extrabold text-slate-950">{t("tours.form.exclusions.title")}</h3>{exclusions.map((item, index) => <div key={`exc-${index}`} className="flex gap-2"><input type="text" value={item} onChange={(event) => updateSimpleList(setExclusions, index, event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-400" />{exclusions.length > 1 ? <button type="button" onClick={() => removeSimpleListItem(setExclusions, index)} className="rounded-sm border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700">-</button> : null}</div>)}<button type="button" onClick={() => addSimpleListItem(setExclusions)} className="rounded-sm border border-stone-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-stone-50">{t("tours.form.exclusions.add")}</button></div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end"><Link to="/admin/tours" className="inline-flex w-full items-center justify-center rounded-sm border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition sm:w-auto">{t("tours.common.cancel")}</Link><button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{saving ? t("tours.common.saving") : isEditMode ? t("tours.common.update") : t("tours.common.save")}</button></div>
        </section>

        <section className="space-y-6">
          <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">{t("tours.form.images.title")}</h3><p className="mt-2 text-sm text-slate-500">{t("tours.form.images.description")}</p></div>
            <div className="space-y-4 px-6 py-6"><label className="space-y-2"><span className="block text-sm font-bold text-slate-800">{t("tours.form.images.add_images")}</span><input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={handleFilesChange} className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white" /></label></div>
          </section>

          <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">{t("tours.form.images.existing_title")}</h3></div>
            <div className="space-y-4 px-6 py-6">{existingImages.length === 0 ? <p className="text-sm text-slate-500">{t("tours.form.images.no_existing")}</p> : existingImages.map((image) => <div key={image.id} className="rounded-sm border border-stone-200 p-4"><div className="flex gap-4"><img src={buildImageUrl(image.image_url)} alt={image.caption || form.title || t("tours.form.images.image_alt")} className="h-24 w-24 rounded-sm object-cover" /><div className="min-w-0 flex-1 space-y-3"><label className="space-y-2"><span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("tours.form.images.caption")}</span><input type="text" value={image.caption || ""} onChange={(event) => handleExistingCaptionChange(image.id, event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label><div className="flex flex-wrap gap-3"><label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="radio" name="cover-selection" checked={coverSelection.type === "existing" && coverSelection.value === image.id} onChange={() => setCoverSelection({ type: "existing", value: image.id })} />{t("tours.form.images.cover")}</label><button type="button" onClick={() => removeExistingImage(image.id)} className="text-sm font-bold text-rose-700 transition hover:text-rose-900">{t("tours.form.images.remove")}</button></div></div></div></div>)}</div>
          </section>

          <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-6 py-5"><h3 className="text-lg font-extrabold text-slate-950">{t("tours.form.images.new_title")}</h3></div>
            <div className="space-y-4 px-6 py-6">{newImages.length === 0 ? <p className="text-sm text-slate-500">{t("tours.form.images.no_new")}</p> : newImages.map((file, index) => <div key={`${file.name}-${index}`} className="rounded-sm border border-stone-200 p-4"><div className="flex gap-4"><img src={newPreviews[index]} alt={file.name} className="h-24 w-24 rounded-sm object-cover" /><div className="min-w-0 flex-1 space-y-3"><p className="truncate text-sm font-bold text-slate-900">{file.name}</p><label className="space-y-2"><span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("tours.form.images.caption")}</span><input type="text" value={newCaptions[index] || ""} onChange={(event) => handleNewCaptionChange(index, event.target.value)} className="w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-400" /></label><div className="flex flex-wrap gap-3"><label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="radio" name="cover-selection" checked={coverSelection.type === "new" && coverSelection.value === index} onChange={() => setCoverSelection({ type: "new", value: index })} />{t("tours.form.images.cover")}</label><button type="button" onClick={() => removeNewImage(index)} className="text-sm font-bold text-rose-700 transition hover:text-rose-900">{t("tours.form.images.remove")}</button></div></div></div></div>)}</div>
          </section>
        </section>
      </form>
    </div>
  );
}
