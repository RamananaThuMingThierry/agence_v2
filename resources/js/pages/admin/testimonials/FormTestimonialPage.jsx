import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createTestimonial, fetchTestimonial, updateTestimonial } from "../../../api/testimonials";

const initialForm = {
  name: "",
  message: "",
  rating: 5,
  status: "publish",
  image: null,
};

function buildImageUrl(path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
}

function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "arrow-left":
      return (
        <svg {...common}>
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function FormTestimonialPage() {
  const { testimonialId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(testimonialId);
  const [form, setForm] = useState(initialForm);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTestimonial() {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const testimonial = await fetchTestimonial(testimonialId);

        if (!active) return;

        setForm({
          name: testimonial?.name || "",
          message: testimonial?.message || "",
          rating: testimonial?.rating ?? 5,
          status: testimonial?.status || "publish",
          image: null,
        });
        setCurrentImage(testimonial?.image ? buildImageUrl(testimonial.image) : "");
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || "Impossible de charger le testimonial.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTestimonial();

    return () => {
      active = false;
    };
  }, [isEditMode, testimonialId]);

  const previewUrl = useMemo(() => {
    if (form.image instanceof File) {
      return URL.createObjectURL(form.image);
    }

    return currentImage;
  }, [currentImage, form.image]);

  useEffect(() => {
    return () => {
      if (previewUrl && form.image instanceof File) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [form.image, previewUrl]);

  function handleChange(event) {
    const { name, value, files } = event.target;

    if (name === "image") {
      setForm((current) => ({
        ...current,
        image: files?.[0] || null,
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: name === "rating" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEditMode) {
        await updateTestimonial(testimonialId, form);
      } else {
        await createTestimonial(form);
      }

      navigate("/admin/testimonials", {
        replace: true,
        state: {
          notice: isEditMode ? "Testimonial mis a jour." : "Testimonial cree.",
        },
      });
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors).flat()[0];
        setError(firstMessage || "Echec de l'enregistrement du testimonial.");
      } else {
        setError(requestError.response?.data?.message || "Echec de l'enregistrement du testimonial.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-sm border border-stone-200 bg-white p-8 text-sm font-semibold text-slate-500 shadow-sm">
        Chargement du testimonial...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
              {isEditMode ? "Modifier le testimonial" : "Ajouter un testimonial"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Renseignez le temoignage client, la note, le statut de publication et son portrait.
            </p>
          </div>

          <Link
            to="/admin/testimonials"
            className="inline-flex items-center justify-center gap-2 self-start rounded-sm border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-black"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            Retour a la liste
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
          <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Nom</span>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                  placeholder="Nom du client"
                />
              </label>

              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Statut</span>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                >
                  <option value="publish">Publie</option>
                  <option value="archived">Archive</option>
                </select>
              </label>
            </div>

            <label className="space-y-2">
              <span className="block text-sm font-bold text-slate-800">Message</span>
              <textarea
                name="message"
                rows="7"
                required
                value={form.message}
                onChange={handleChange}
                className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                placeholder="Retour d'experience du voyageur"
              />
            </label>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Photo</span>
                <input
                  type="file"
                  name="image"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleChange}
                  className="block w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-sm file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-bold file:text-white"
                />

                {previewUrl ? (
                  <div className="h-64 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                    <img src={previewUrl} alt={form.name || "Apercu du testimonial"} className="h-full w-full object-cover" />
                  </div>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="block text-sm font-bold text-slate-800">Note</span>
                <select
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-red-400"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} etoile{value > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-center">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Apercu note</p>
                  <p className="mt-3 text-2xl tracking-[0.3em] text-amber-500">{"★".repeat(form.rating || 5)}</p>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/admin/testimonials"
                className="inline-flex w-full items-center justify-center rounded-sm border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition sm:w-auto"
              >
                Annuler
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-sm bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Enregistrement..." : isEditMode ? "Mettre a jour" : "Enregistrer"}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
