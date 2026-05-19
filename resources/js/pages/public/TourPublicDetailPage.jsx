import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { createPublicTourReview, fetchPublicTour, fetchPublicTours } from "../../api/tours";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import TopBar from "../../components/public/TopBar";
import { useI18n } from "../../hooks/admin/I18nContext";
import { buildImageUrl, mapTourToPublicItem } from "../../utils/publicTour";

function ArrowIcon({ direction = "left", className = "h-5 w-5" }) {
  const path = direction === "left" ? "M15 18 9 12l6-6" : "m9 18 6-6-6-6";

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function StarRating({ value = 5, className = "text-amber-400" }) {
  const count = Math.max(1, Math.min(5, Number(value || 0)));
  return <span className={className}>{"\u2605".repeat(count)}<span className="text-stone-300">{"\u2605".repeat(5 - count)}</span></span>;
}

function StarInput({ value = 5, onChange, t }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= Number(value || 0);

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={active ? "text-3xl text-amber-400 transition hover:scale-110" : "text-3xl text-stone-300 transition hover:scale-110 hover:text-amber-300"}
            aria-label={t("public.tour_detail.review.rating_label", { count: star })}
          >
            {"\u2605"}
          </button>
        );
      })}
      <span className="text-sm font-semibold text-slate-500">{value}/5</span>
    </div>
  );
}

const initialReviewForm = {
  name: "",
  rating: 5,
  review: "",
  image: null,
};

function formatPrice(price, lang) {
  const localeMap = { fr: "fr-FR", en: "en-GB", es: "es-ES", de: "de-DE" };
  return Number(price || 0).toLocaleString(localeMap[lang] || "fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(value, lang) {
  if (!value) return "";
  const localeMap = { fr: "fr-FR", en: "en-GB", es: "es-ES", de: "de-DE" };
  return new Date(value).toLocaleDateString(localeMap[lang] || "fr-FR");
}

export default function TourPublicDetailPage() {
  const { t, lang } = useI18n();
  const { tourId } = useParams();
  const [platformMeta, setPlatformMeta] = useState({
    logo: "/images/logo.png",
    brand: "World of Madagascar",
    tagline: t("public.home.meta.tagline"),
    topBarLeft: t("public.home.meta.topbar_left"),
    contact: "+261 38 09 137 03",
    whatsapp: "https://wa.me/261380913703",
    email: "worldofmadagascartour@gmail.com",
  });
  const [tour, setTour] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [reviewErrors, setReviewErrors] = useState({});
  const [reviewNotice, setReviewNotice] = useState("");
  const [reviewNoticeType, setReviewNoticeType] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const reviewFileInputRef = useRef(null);

  const paymentMethods = useMemo(
    () => [
      t("public.home.payment_methods.0"),
      t("public.home.payment_methods.1"),
      t("public.home.payment_methods.2"),
      t("public.home.payment_methods.3"),
      t("public.home.payment_methods.4"),
      t("public.home.payment_methods.5"),
    ],
    [t],
  );

  const publicLinks = useMemo(
    () => [
      { href: "/#home", label: t("public.home.nav.home") },
      { href: "/#about", label: t("public.home.nav.about") },
      { href: "/#tours", label: t("public.home.nav.tours") },
      { href: "/#gallery", label: t("public.home.nav.gallery") },
      { href: "/#why", label: t("public.home.nav.why") },
      { href: "/#testimonials", label: t("public.home.nav.testimonials") },
      { href: "/#contact", label: t("public.home.nav.contact") },
    ],
    [t],
  );

  const footerLinks = useMemo(
    () => [
      { label: t("public.home.nav.home"), href: "/#home" },
      { label: t("public.home.nav.about"), href: "/#about" },
      { label: t("public.home.nav.tours"), href: "/#tours" },
      { label: t("public.home.nav.gallery"), href: "/#gallery" },
      { label: t("public.home.nav.why"), href: "/#why" },
      { label: t("public.home.nav.testimonials"), href: "/#testimonials" },
      { label: t("public.home.nav.contact"), href: "/#contact" },
    ],
    [t],
  );

  useEffect(() => {
    setPlatformMeta((current) => ({
      ...current,
      tagline: t("public.home.meta.tagline"),
      topBarLeft: t("public.home.meta.topbar_left"),
    }));
  }, [t]);

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
          contact: settings.contact || current.contact,
          whatsapp: settings.whatsapp || current.whatsapp,
          email: settings.email || current.email,
        }));
      } catch {
        if (active) {
          setPlatformMeta((current) => ({ ...current }));
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

    async function loadTour() {
      setLoading(true);

      try {
        const [tourItem, allItems] = await Promise.all([
          fetchPublicTour(tourId),
          fetchPublicTours(),
        ]);

        if (!active) return;

        const mappedTour = tourItem ? mapTourToPublicItem(tourItem, t) : null;
        const mappedItems = Array.isArray(allItems) ? allItems.map((item) => mapTourToPublicItem(item, t)) : [];

        setTour(
          mappedTour
            ? {
                ...mappedTour,
                formattedPrice: formatPrice(mappedTour.price, lang),
              }
            : null,
        );
        setRelated(
          mappedItems
            .filter((item) => item.tourId !== tourId)
            .slice(0, 4)
            .map((item) => ({
              ...item,
              formattedPrice: formatPrice(item.price, lang),
            })),
        );
      } catch {
        if (active) {
          setTour(null);
          setRelated([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTour();

    return () => {
      active = false;
    };
  }, [tourId, lang]);

  const reviewImagePreview = useMemo(
    () => (reviewForm.image instanceof File ? URL.createObjectURL(reviewForm.image) : ""),
    [reviewForm.image],
  );

  useEffect(() => {
    return () => {
      if (reviewImagePreview) {
        URL.revokeObjectURL(reviewImagePreview);
      }
    };
  }, [reviewImagePreview]);

  const coverImage = tour?.images?.find((image) => image.isCover)?.image || tour?.image;
  const tourImages = tour?.images?.length ? tour.images : coverImage ? [{ id: "cover", image: coverImage, caption: tour?.title || "", isCover: true }] : [];
  const activeImage = tourImages[activeImageIndex] || tourImages[0] || null;
  const averageRating = tour?.reviews?.length ? (tour.reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / tour.reviews.length).toFixed(1) : null;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [tourId, tourImages.length]);

  function goToImage(nextIndex) {
    if (tourImages.length === 0) return;
    const normalized = (nextIndex + tourImages.length) % tourImages.length;
    setActiveImageIndex(normalized);
  }

  function handleReviewChange(event) {
    const { name, value, files } = event.target;

    setReviewForm((current) => ({
      ...current,
      [name]: name === "image" ? files?.[0] ?? null : name === "rating" ? Number(value) : value,
    }));
    setReviewErrors((current) => ({ ...current, [name]: undefined }));
    setReviewNotice("");
    setReviewNoticeType("");
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    if (!tour) return;

    setReviewSubmitting(true);
    setReviewErrors({});
    setReviewNotice("");
    setReviewNoticeType("");

    try {
      const result = await createPublicTourReview(tour.tourId, reviewForm);
      const createdReview = result?.review ? {
        id: result.review.id,
        name: result.review.name || reviewForm.name,
        rating: Number(result.review.rating || reviewForm.rating),
        review: result.review.review || reviewForm.review,
        image: buildImageUrl(result.review.image),
        createdAt: result.review.created_at || new Date().toISOString(),
      } : null;

      setTour((current) => current ? ({
        ...current,
        reviews: createdReview ? [createdReview, ...(current.reviews || [])] : current.reviews,
      }) : current);
      setReviewForm(initialReviewForm);
      if (reviewFileInputRef.current) {
        reviewFileInputRef.current.value = "";
      }
      setReviewNotice(result?.message || t("public.tour_detail.review.success"));
      setReviewNoticeType("success");
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const normalized = Object.fromEntries(Object.entries(apiErrors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)]));
        setReviewErrors(normalized);
      }
      setReviewNotice(error?.response?.data?.message || t("public.tour_detail.review.error"));
      setReviewNoticeType("error");
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <div className="bg-stone-50 text-slate-800">
      <TopBar leftText={platformMeta.topBarLeft} contact={platformMeta.contact} email={platformMeta.email} />
      <PublicHeader
        logo={platformMeta.logo}
        brand={platformMeta.brand}
        tagline={platformMeta.tagline}
        links={publicLinks}
        homeHref="/#home"
        contactHref="/#contact"
      />
      <section className="bg-stone-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          {loading ? (
            <div className="rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center text-sm font-semibold text-slate-500 shadow-sm">{t("public.tour_detail.loading")}</div>
          ) : !tour ? (
            <div className="rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center text-sm font-semibold text-slate-500 shadow-sm">{t("public.tour_detail.not_found")}</div>
          ) : (
            <>
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm lg:col-span-2">
                  <div className="relative">
                    {activeImage ? <img src={activeImage.image} alt={activeImage.caption || tour.title} className="h-[540px] w-full object-cover" /> : null}
                    {tourImages.length > 1 ? (
                      <>
                        <button type="button" onClick={() => goToImage(activeImageIndex - 1)} className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-lg transition hover:bg-white"><ArrowIcon direction="left" className="h-6 w-6" /></button>
                        <button type="button" onClick={() => goToImage(activeImageIndex + 1)} className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-lg transition hover:bg-white"><ArrowIcon direction="right" className="h-6 w-6" /></button>
                      </>
                    ) : null}
                  </div>
                  {tourImages.length > 1 ? (
                    <div className="grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
                      {tourImages.map((image, index) => (
                        <button key={image.id} type="button" onClick={() => setActiveImageIndex(index)} className={index === activeImageIndex ? "overflow-hidden rounded-2xl ring-4 ring-emerald-600" : "overflow-hidden rounded-2xl opacity-80 transition hover:opacity-100"}>
                          <img src={image.image} alt={image.caption || `${tour.title} ${index + 1}`} className="h-24 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="p-6 md:p-8">
                    <div className="mb-5 flex flex-wrap gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${tour.categoryTone}`}>{tour.category}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{tour.duration}</span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{t("public.tour_detail.departure_badge", { value: tour.departure })}</span>
                    </div>
                    <h2 className="mb-4 text-3xl font-extrabold text-slate-900 md:text-4xl">{tour.title}</h2>
                    <p className="mb-8 leading-relaxed text-slate-600">{tour.description || t("public.tour_detail.description_coming")}</p>
                    <div className="mb-8 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-stone-50 p-4">
                        <p className="text-sm text-slate-500">{t("public.tour_detail.summary.duration")}</p>
                        <p className="font-extrabold text-slate-900">{tour.duration}</p>
                      </div>
                      <div className="rounded-2xl bg-stone-50 p-4">
                        <p className="text-sm text-slate-500">{t("public.tour_detail.summary.style")}</p>
                        <p className="font-extrabold text-slate-900">{tour.category}</p>
                      </div>
                      <div className="rounded-2xl bg-stone-50 p-4">
                        <p className="text-sm text-slate-500">{t("public.tour_detail.summary.price")}</p>
                        <p className="font-extrabold text-emerald-800">{tour.formattedPrice}</p>
                      </div>
                    </div>
                    <h3 className="mb-4 text-2xl font-extrabold text-slate-900">{t("public.tour_detail.program_title")}</h3>
                    <div className="mb-8 space-y-5">
                      {tour.programs.length === 0 ? (
                        <p className="text-sm text-slate-500">{t("public.tour_detail.program_empty")}</p>
                      ) : tour.programs.map((program) => (
                        <div key={program.id || `${program.day_number}-${program.title}`} className="border-l-4 border-emerald-700 pl-5">
                          <h4 className="font-extrabold text-slate-900">{t("public.tour_detail.day_title", { day: program.day_number, title: program.title })}</h4>
                          <p className="text-sm leading-relaxed text-slate-600">{program.description}</p>
                          {program.activities ? <p className="mt-2 text-sm text-slate-500">{t("public.tour_detail.activities", { value: program.activities })}</p> : null}
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="rounded-3xl bg-emerald-50 p-6">
                        <h3 className="mb-4 font-extrabold text-emerald-900">{t("public.tour_detail.included")}</h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {tour.inclusions.length === 0 ? <li>{t("public.tour_detail.included_empty")}</li> : tour.inclusions.map((item) => <li key={item.id || item.description}>{item.description}</li>)}
                        </ul>
                      </div>
                      <div className="rounded-3xl bg-rose-50 p-6">
                        <h3 className="mb-4 font-extrabold text-rose-900">{t("public.tour_detail.excluded")}</h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {tour.exclusions.length === 0 ? <li>{t("public.tour_detail.excluded_empty")}</li> : tour.exclusions.map((item) => <li key={item.id || item.description}>{item.description}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <aside className="lg:col-span-1">
                  <div className="sticky top-28 rounded-3xl bg-white p-6 shadow-sm">
                    <h3 className="mb-2 text-2xl font-extrabold text-slate-900">{t("public.tour_detail.sidebar.title")}</h3>
                    <p className="mb-6 text-sm text-slate-600">{t("public.tour_detail.sidebar.text")}</p>
                    <div className="mb-6 space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-100 pb-3"><span>{t("public.tour_detail.summary.duration")}</span><strong>{tour.duration}</strong></div>
                      <div className="flex justify-between border-b border-slate-100 pb-3"><span>{t("public.tour_detail.summary.departure")}</span><strong>{tour.departure}</strong></div>
                      <div className="flex justify-between border-b border-slate-100 pb-3"><span>{t("public.tour_detail.summary.type")}</span><strong>{t("public.tour_detail.summary.private")}</strong></div>
                      <div className="flex justify-between"><span>{t("public.tour_detail.summary.price")}</span><strong className="text-emerald-800">{tour.formattedPrice}</strong></div>
                    </div>
                    <Link to={`/reservations/${tour.tourId}`} className="block rounded-full bg-emerald-700 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-800">{t("public.common.book")}</Link>
                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <h4 className="mb-3 font-extrabold text-slate-900">{t("public.tour_detail.sidebar.payments")}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">{paymentMethods.map((item) => <span key={item} className="rounded-xl bg-slate-100 px-3 py-2 text-center">{item}</span>)}</div>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-emerald-700">{t("public.tour_detail.reviews.eyebrow")}</p>
                      <h2 className="text-2xl font-extrabold text-slate-900">{t("public.tour_detail.reviews.title")}</h2>
                    </div>
                    <div className="rounded-2xl bg-stone-50 px-4 py-3 text-right">
                      <p className="text-sm text-slate-500">{t("public.tour_detail.reviews.average")}</p>
                      <p className="text-2xl font-extrabold text-slate-900">{averageRating || "-"}/5</p>
                    </div>
                  </div>

                  {tour.reviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-300 px-5 py-8 text-sm text-slate-500">{t("public.tour_detail.reviews.empty")}</div>
                  ) : (
                    <div className="space-y-5">
                      {tour.reviews.map((review) => (
                        <article key={review.id} className="rounded-3xl border border-stone-200 p-5">
                          <div className="mb-3 flex items-start gap-4">
                            <img src={review.image || "/images/profil.png"} alt={review.name} className="h-14 w-14 rounded-full object-cover" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <p className="font-extrabold text-slate-900">{review.name}</p>
                                  <p className="text-sm text-slate-500">{review.createdAt ? formatDate(review.createdAt, lang) : t("public.tour_detail.reviews.recent")}</p>
                                </div>
                                <StarRating value={review.rating} />
                              </div>
                              <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.review}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
                  <p className="mb-2 text-sm font-bold uppercase tracking-wide text-emerald-700">{t("public.tour_detail.review.eyebrow")}</p>
                  <h2 className="mb-3 text-2xl font-extrabold text-slate-900">{t("public.tour_detail.review.title")}</h2>
                  <p className="mb-6 text-sm leading-relaxed text-slate-600">{t("public.tour_detail.review.text")}</p>
                  {reviewNotice ? <div className={`mb-5 rounded-2xl px-4 py-3 text-sm font-semibold ${reviewNoticeType === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-rose-200 bg-rose-50 text-rose-700"}`}>{reviewNotice}</div> : null}
                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.tour_detail.review.fields.image")}</span>
                      <div className="flex items-center gap-4">
                        <img src={reviewImagePreview || "/images/profil.png"} alt={t("public.tour_detail.review.preview_alt")} className="h-16 w-16 rounded-full object-cover ring-2 ring-stone-200" />
                        <input ref={reviewFileInputRef} type="file" name="image" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleReviewChange} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:font-bold file:text-emerald-800 hover:file:bg-emerald-200" />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{t("public.tour_detail.review.fields.image_help")}</p>
                      {reviewErrors.image ? <span className="mt-2 block text-xs font-semibold text-rose-600">{reviewErrors.image}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.tour_detail.review.fields.name")}</span>
                      <input type="text" name="name" value={reviewForm.name} onChange={handleReviewChange} className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder={t("public.tour_detail.review.fields.name_placeholder")} />
                      {reviewErrors.name ? <span className="mt-2 block text-xs font-semibold text-rose-600">{reviewErrors.name}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.tour_detail.review.fields.rating")}</span>
                      <StarInput value={reviewForm.rating} onChange={(rating) => {
                        setReviewForm((current) => ({ ...current, rating }));
                        setReviewErrors((current) => ({ ...current, rating: undefined }));
                        setReviewNotice("");
                        setReviewNoticeType("");
                      }} t={t} />
                      {reviewErrors.rating ? <span className="mt-2 block text-xs font-semibold text-rose-600">{reviewErrors.rating}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.tour_detail.review.fields.review")}</span>
                      <textarea name="review" value={reviewForm.review} onChange={handleReviewChange} rows="6" className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder={t("public.tour_detail.review.fields.review_placeholder")} />
                      {reviewErrors.review ? <span className="mt-2 block text-xs font-semibold text-rose-600">{reviewErrors.review}</span> : null}
                    </label>
                    <button type="submit" disabled={reviewSubmitting} className="inline-flex rounded-full bg-slate-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">{reviewSubmitting ? t("public.tour_detail.review.submitting") : t("public.tour_detail.review.submit")}</button>
                  </form>
                </section>
              </div>

              {related.length > 0 ? (
                <div className="mt-14">
                  <h2 className="mb-6 text-2xl font-extrabold text-slate-900">{t("public.tour_detail.related")}</h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {related.map((item) => (
                      <Link key={item.tourId} to={`/circuits/${item.tourId}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm">
                        <img src={item.image} alt={item.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="p-4">
                          <h3 className="font-extrabold">{item.title}</h3>
                          <p className="text-sm text-slate-500">{item.departure}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
      <PublicFooter footerLinks={footerLinks} logo={platformMeta.logo} brand={platformMeta.brand} />
      <ScrollToTopButton />
    </div>
  );
}
