import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { createPublicTestimonial, fetchPublishedTestimonials } from "../../api/testimonials";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import TopBar from "../../components/public/TopBar";
import WhatsAppButton from "../../components/public/WhatsAppButton";
import { contactLinks, footerLinks, navLinks, siteMeta } from "../../data/publicHomeData";

function buildImageUrl(path) {
  if (!path) return "/images/profil.png";
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className={filled ? "h-5 w-5 fill-amber-400 text-amber-400" : "h-5 w-5 fill-stone-200 text-stone-200"} aria-hidden="true">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function StarRating({ value = 5 }) {
  const count = Math.max(1, Math.min(5, Number(value || 0)));
  return <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((star) => <StarIcon key={star} filled={star <= count} />)}</div>;
}

function StarInput({ value = 5, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="transition hover:scale-110" aria-label={`Donner ${star} etoile${star > 1 ? "s" : ""}`}>
          <StarIcon filled={star <= Number(value || 0)} />
        </button>
      ))}
      <span className="text-sm font-semibold text-slate-500">{value}/5</span>
    </div>
  );
}

const initialForm = {
  name: "",
  message: "",
  rating: 5,
  image: null,
};

export default function TestimonialsListPage() {
  const [platformMeta, setPlatformMeta] = useState(siteMeta);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadPlatformMeta() {
      try {
        const settings = await fetchPlatformSettings();

        if (!active || !settings) return;

        setPlatformMeta((current) => ({
          ...current,
          logo: settings.logo ? `/${String(settings.logo).replace(/^\/+/, "")}` : current.logo,
          brand: settings.platform_name || current.brand,
        }));
      } catch {
        if (active) {
          setPlatformMeta(siteMeta);
        }
      }
    }

    loadPlatformMeta();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadTestimonials() {
      setLoading(true);

      try {
        const items = await fetchPublishedTestimonials();
        if (!active) return;
        setTestimonials(Array.isArray(items) ? items : []);
      } catch {
        if (active) {
          setTestimonials([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTestimonials();

    return () => {
      active = false;
    };
  }, []);

  const publicLinks = useMemo(
    () => navLinks.map((link) => ({
      ...link,
      href: link.href.startsWith("#") ? `/${link.href}` : link.href,
    })),
    [],
  );

  const imagePreview = useMemo(() => (form.image instanceof File ? URL.createObjectURL(form.image) : ""), [form.image]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleChange(event) {
    const { name, value, files } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "image" ? files?.[0] ?? null : value,
    }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setNotice("");

    try {
      const result = await createPublicTestimonial(form);
      const created = result?.testimonial;

      if (created) {
        setTestimonials((current) => [created, ...current]);
      }

      setForm(initialForm);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setNotice(result?.message || "Avis envoye avec succes.");
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const normalized = Object.fromEntries(Object.entries(apiErrors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)]));
        setFieldErrors(normalized);
      }
      setNotice(error?.response?.data?.message || "Impossible d'envoyer votre avis pour le moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-stone-50 text-slate-800">
      <TopBar leftText={platformMeta.topBarLeft} rightText={platformMeta.topBarRight} />
      <PublicHeader logo={platformMeta.logo} brand={platformMeta.brand} tagline={platformMeta.tagline} links={publicLinks} homeHref="/#home" contactHref="/#contact" />
      <section className="bg-stone-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-700">Temoignages</p>
              <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Tous les avis de nos voyageurs</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">Retrouvez l'ensemble des testimonials publies et laissez aussi votre propre avis sur votre experience.</p>
            </div>
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Avis publies</p>
              <p className="text-3xl font-extrabold text-slate-900">{testimonials.length}</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
              {loading ? (
                <div className="rounded-2xl border border-stone-200 px-5 py-8 text-center text-sm font-semibold text-slate-500">Chargement des avis...</div>
              ) : testimonials.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 px-5 py-8 text-sm text-slate-500">Aucun avis publie pour le moment.</div>
              ) : (
                <div className="space-y-5">
                  {testimonials.map((item, index) => {
                    const rating = Math.max(1, Math.min(5, Number(item?.rating || 5)));
                    const image = buildImageUrl(item?.image);

                    return (
                      <article key={item?.encrypted_id || item?.id || `${item?.name}-${index}`} className="rounded-3xl border border-stone-200 p-5">
                        <div className="flex items-start gap-4">
                          <img src={image} alt={item?.name || "Voyageur"} className="h-14 w-14 rounded-full object-cover" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <p className="font-extrabold text-slate-900">{item?.name || "Voyageur"}</p>
                                <p className="text-sm text-slate-500">{item?.created_at ? new Date(item.created_at).toLocaleDateString("fr-FR") : "Avis recent"}</p>
                              </div>
                              <StarRating value={rating} />
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">"{item?.message || ""}"</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-emerald-700">Laisser un avis</p>
              <h2 className="mb-3 text-2xl font-extrabold text-slate-900">Partagez votre experience</h2>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">Les clients peuvent publier leur avis directement depuis cette page.</p>
              {notice ? <div className={`mb-5 rounded-2xl px-4 py-3 text-sm font-semibold ${notice.includes("succes") ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-rose-200 bg-rose-50 text-rose-700"}`}>{notice}</div> : null}
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Photo de profil</span>
                  <div className="flex items-center gap-4">
                    <img src={imagePreview || "/images/profil.png"} alt="Apercu du profil" className="h-16 w-16 rounded-full object-cover ring-2 ring-stone-200" />
                    <input ref={fileInputRef} type="file" name="image" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleChange} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:font-bold file:text-emerald-800 hover:file:bg-emerald-200" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Optionnel. Si aucune image n'est choisie, une image de profil par defaut sera affichee.</p>
                  {fieldErrors.image ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.image}</span> : null}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Nom</span>
                  <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="Votre nom" />
                  {fieldErrors.name ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.name}</span> : null}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Note</span>
                  <StarInput value={form.rating} onChange={(rating) => {
                    setForm((current) => ({ ...current, rating }));
                    setFieldErrors((current) => ({ ...current, rating: undefined }));
                    setNotice("");
                  }} />
                  {fieldErrors.rating ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.rating}</span> : null}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Votre avis</span>
                  <textarea name="message" value={form.message} onChange={handleChange} rows="6" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="Decrivez votre experience avec l'agence." />
                  {fieldErrors.message ? <span className="mt-2 block text-xs font-semibold text-rose-600">{fieldErrors.message}</span> : null}
                </label>
                <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 px-7 py-3 w-full text-center text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">{submitting ? "Envoi en cours..." : "Publier mon avis"}</button>
              </form>
            </section>
          </div>
        </div>
      </section>
      <PublicFooter footerLinks={footerLinks} contactLinks={contactLinks} />
      <WhatsAppButton href="/#contact" />
    </div>
  );
}
