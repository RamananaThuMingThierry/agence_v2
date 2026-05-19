import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { createPublicTourReview, fetchPublicTour, fetchPublicTours } from "../../api/tours";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import TopBar from "../../components/public/TopBar";
import { useI18n } from "../../hooks/admin/I18nContext";
import { formatUsd } from "../../utils/currency";
import { buildImageUrl, mapTourToPublicItem } from "../../utils/publicTour";
import { localizePublicValidationErrors } from "../../utils/publicValidation";

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
  return formatUsd(price, localeMap[lang] || "fr-FR");
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
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
    setLightboxOpen(false);
  }, [tourId, tourImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        goToImage(activeImageIndex - 1);
      }

      if (event.key === "ArrowRight") {
        goToImage(activeImageIndex + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex, lightboxOpen, tourImages.length]);

  function goToImage(nextIndex) {
    if (tourImages.length === 0) return;
    const normalized = (nextIndex + tourImages.length) % tourImages.length;
    setActiveImageIndex(normalized);
  }

  function openLightbox(index) {
    setActiveImageIndex(index);
    setLightboxOpen(true);
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
        setReviewErrors(
          localizePublicValidationErrors({
            lang,
            errors: normalized,
            fieldLabels: {
              image: t("public.tour_detail.review.fields.image"),
              name: t("public.tour_detail.review.fields.name"),
              rating: t("public.tour_detail.review.fields.rating"),
              review: t("public.tour_detail.review.fields.review"),
            },
          }),
        );
      }
      setReviewNotice(error?.response?.data?.message || t("public.tour_detail.review.error"));
      setReviewNoticeType("error");
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <div className="public-shell">
      <TopBar leftText={platformMeta.topBarLeft} contact={platformMeta.contact} email={platformMeta.email} />
      <PublicHeader
        logo={platformMeta.logo}
        brand={platformMeta.brand}
        tagline={platformMeta.tagline}
        links={publicLinks}
        homeHref="/#home"
        contactHref="/#contact"
      />
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          {loading ? (
            <div className="public-panel rounded-3xl px-6 py-12 text-center text-sm font-semibold text-[color:var(--muted)]">{t("public.tour_detail.loading")}</div>
          ) : !tour ? (
            <div className="public-panel rounded-3xl px-6 py-12 text-center text-sm font-semibold text-[color:var(--muted)]">{t("public.tour_detail.not_found")}</div>
          ) : (
            <>
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="public-panel overflow-hidden rounded-3xl lg:col-span-2">
                  <div className="relative">
                    {activeImage ? (
                      <button type="button" onClick={() => openLightbox(activeImageIndex)} className="block w-full text-left">
                        <img src={activeImage.image} alt={activeImage.caption || tour.title} className="h-[320px] w-full object-cover sm:h-[460px] lg:h-[540px]" />
                      </button>
                    ) : null}
                    {tourImages.length > 1 ? (
                      <>
                        <button type="button" onClick={() => goToImage(activeImageIndex - 1)} className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-lg transition hover:bg-white sm:left-4 sm:h-12 sm:w-12"><ArrowIcon direction="left" className="h-6 w-6" /></button>
                        <button type="button" onClick={() => goToImage(activeImageIndex + 1)} className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-lg transition hover:bg-white sm:right-4 sm:h-12 sm:w-12"><ArrowIcon direction="right" className="h-6 w-6" /></button>
                      </>
                    ) : null}
                  </div>
                  {tourImages.length > 1 ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 p-4 md:hidden">
                        {tourImages.map((image, index) => (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => openLightbox(index)}
                            className={index === activeImageIndex ? "overflow-hidden rounded-3xl ring-4 ring-[color:var(--accent)]" : "overflow-hidden rounded-3xl opacity-95 transition hover:opacity-100"}
                          >
                            <img src={image.image} alt={image.caption || `${tour.title} ${index + 1}`} className="h-36 w-full object-cover" />
                            <div className="bg-white px-4 py-3 text-left">
                              <p className="text-sm font-bold text-[color:var(--accent-deep)]">
                                {index + 1}/{tourImages.length}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-[color:var(--muted)]">
                                {image.caption || tour.title}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="hidden gap-3 p-4 md:grid md:grid-cols-3 lg:grid-cols-4">
                        {tourImages.map((image, index) => (
                          <button key={image.id} type="button" onClick={() => openLightbox(index)} className={index === activeImageIndex ? "overflow-hidden rounded-2xl ring-4 ring-[color:var(--accent)]" : "overflow-hidden rounded-2xl opacity-80 transition hover:opacity-100"}>
                            <img src={image.image} alt={image.caption || `${tour.title} ${index + 1}`} className="h-24 w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                  <div className="p-6 md:p-8">
                    <div className="mb-5 flex flex-wrap gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${tour.categoryTone}`}>{tour.category}</span>
                      <span className="rounded-full bg-[rgba(238,225,207,0.7)] px-3 py-1 text-xs font-bold text-[color:var(--ink-soft)]">{tour.duration}</span>
                      <span className="rounded-full bg-[rgba(245,208,137,0.26)] px-3 py-1 text-xs font-bold text-[#855611]">{t("public.tour_detail.departure_badge", { value: tour.departure })}</span>
                    </div>
                    <h2 className="public-heading mb-4 text-3xl font-extrabold md:text-4xl">{tour.title}</h2>
                    <p className="public-copy mb-8 leading-relaxed">{tour.description || t("public.tour_detail.description_coming")}</p>
                    <div className="mb-8 grid gap-4 md:grid-cols-3">
                      <div className="public-soft-panel rounded-2xl p-4">
                        <p className="text-sm text-[color:var(--muted)]">{t("public.tour_detail.summary.duration")}</p>
                        <p className="font-extrabold text-[color:var(--accent-deep)]">{tour.duration}</p>
                      </div>
                      <div className="public-soft-panel rounded-2xl p-4">
                        <p className="text-sm text-[color:var(--muted)]">{t("public.tour_detail.summary.style")}</p>
                        <p className="font-extrabold text-[color:var(--accent-deep)]">{tour.category}</p>
                      </div>
                      <div className="public-soft-panel rounded-2xl p-4">
                        <p className="text-sm text-[color:var(--muted)]">{t("public.tour_detail.summary.price")}</p>
                        <p className="public-price font-extrabold">{tour.formattedPrice}</p>
                      </div>
                    </div>
                    <h3 className="public-heading mb-4 text-2xl font-extrabold">{t("public.tour_detail.program_title")}</h3>
                    <div className="mb-8 space-y-5">
                      {tour.programs.length === 0 ? (
                        <p className="text-sm text-[color:var(--muted)]">{t("public.tour_detail.program_empty")}</p>
                      ) : tour.programs.map((program) => (
                        <div key={program.id || `${program.day_number}-${program.title}`} className="border-l-4 border-[color:var(--accent)] pl-5">
                          <h4 className="font-extrabold text-[color:var(--accent-deep)]">{t("public.tour_detail.day_title", { day: program.day_number, title: program.title })}</h4>
                          <p className="text-sm leading-relaxed text-[color:var(--ink-soft)]">{program.description}</p>
                          {program.activities ? <p className="mt-2 text-sm text-[color:var(--muted)]">{t("public.tour_detail.activities", { value: program.activities })}</p> : null}
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="rounded-3xl bg-[rgba(115,132,106,0.12)] p-6">
                        <h3 className="mb-4 font-extrabold text-[color:var(--success)]">{t("public.tour_detail.included")}</h3>
                        <ul className="space-y-2 text-sm text-[color:var(--ink-soft)]">
                          {tour.inclusions.length === 0 ? <li>{t("public.tour_detail.included_empty")}</li> : tour.inclusions.map((item) => <li key={item.id || item.description}>{item.description}</li>)}
                        </ul>
                      </div>
                      <div className="rounded-3xl bg-[rgba(198,90,61,0.08)] p-6">
                        <h3 className="mb-4 font-extrabold text-rose-900">{t("public.tour_detail.excluded")}</h3>
                        <ul className="space-y-2 text-sm text-[color:var(--ink-soft)]">
                          {tour.exclusions.length === 0 ? <li>{t("public.tour_detail.excluded_empty")}</li> : tour.exclusions.map((item) => <li key={item.id || item.description}>{item.description}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <aside className="lg:col-span-1">
                  <div className="public-panel sticky top-28 rounded-3xl p-6">
                    <h3 className="public-heading mb-2 text-2xl font-extrabold">{t("public.tour_detail.sidebar.title")}</h3>
                    <p className="mb-6 text-sm text-[color:var(--ink-soft)]">{t("public.tour_detail.sidebar.text")}</p>
                    <div className="mb-6 space-y-3 text-sm">
                      <div className="flex justify-between border-b border-[rgba(125,94,78,0.12)] pb-3"><span>{t("public.tour_detail.summary.duration")}</span><strong>{tour.duration}</strong></div>
                      <div className="flex justify-between border-b border-[rgba(125,94,78,0.12)] pb-3"><span>{t("public.tour_detail.summary.departure")}</span><strong>{tour.departure}</strong></div>
                      <div className="flex justify-between border-b border-[rgba(125,94,78,0.12)] pb-3"><span>{t("public.tour_detail.summary.type")}</span><strong>{t("public.tour_detail.summary.private")}</strong></div>
                      <div className="flex justify-between"><span>{t("public.tour_detail.summary.price")}</span><strong className="public-price">{tour.formattedPrice}</strong></div>
                    </div>
                    <Link to={`/reservations/${tour.tourId}`} className="public-btn-primary block rounded-full py-4 text-center font-bold transition">{t("public.common.book")}</Link>
                    <div className="mt-6 border-t border-[rgba(125,94,78,0.12)] pt-6">
                      <h4 className="public-heading mb-3 font-extrabold">{t("public.tour_detail.sidebar.payments")}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[color:var(--ink-soft)]">{paymentMethods.map((item) => <span key={item} className="rounded-xl bg-[rgba(238,225,207,0.72)] px-3 py-2 text-center">{item}</span>)}</div>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="public-panel rounded-3xl p-6 md:p-8">
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="public-eyebrow mb-2 text-sm font-bold uppercase">{t("public.tour_detail.reviews.eyebrow")}</p>
                      <h2 className="public-heading text-2xl font-extrabold">{t("public.tour_detail.reviews.title")}</h2>
                    </div>
                    <div className="public-soft-panel rounded-2xl px-4 py-3 text-right">
                      <p className="text-sm text-[color:var(--muted)]">{t("public.tour_detail.reviews.average")}</p>
                      <p className="public-heading text-2xl font-extrabold">{averageRating || "-"}/5</p>
                    </div>
                  </div>

                  {tour.reviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[rgba(125,94,78,0.24)] px-5 py-8 text-sm text-[color:var(--muted)]">{t("public.tour_detail.reviews.empty")}</div>
                  ) : (
                    <div className="space-y-5">
                      {tour.reviews.map((review) => (
                        <article key={review.id} className="rounded-3xl border border-[rgba(125,94,78,0.16)] bg-white/56 p-5">
                          <div className="mb-3 flex items-start gap-4">
                            <img src={review.image || "/images/profil.png"} alt={review.name} className="h-14 w-14 rounded-full object-cover" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <p className="font-extrabold text-[color:var(--accent-deep)]">{review.name}</p>
                                  <p className="text-sm text-[color:var(--muted)]">{review.createdAt ? formatDate(review.createdAt, lang) : t("public.tour_detail.reviews.recent")}</p>
                                </div>
                                <StarRating value={review.rating} />
                              </div>
                              <p className="mt-3 text-sm leading-relaxed text-[color:var(--ink-soft)]">{review.review}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section className="public-panel rounded-3xl p-6 md:p-8">
                  <p className="public-eyebrow mb-2 text-sm font-bold uppercase">{t("public.tour_detail.review.eyebrow")}</p>
                  <h2 className="public-heading mb-3 text-2xl font-extrabold">{t("public.tour_detail.review.title")}</h2>
                  <p className="mb-6 text-sm leading-relaxed text-[color:var(--ink-soft)]">{t("public.tour_detail.review.text")}</p>
                  {reviewNotice ? <div className={`mb-5 rounded-2xl px-4 py-3 text-sm font-semibold ${reviewNoticeType === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-rose-200 bg-rose-50 text-rose-700"}`}>{reviewNotice}</div> : null}
                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.tour_detail.review.fields.image")}</span>
                      <div className="flex items-center gap-4">
                        <img src={reviewImagePreview || "/images/profil.png"} alt={t("public.tour_detail.review.preview_alt")} className="h-16 w-16 rounded-full object-cover ring-2 ring-[rgba(125,94,78,0.18)]" />
                        <input ref={reviewFileInputRef} type="file" name="image" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleReviewChange} className="block w-full text-sm text-[color:var(--ink-soft)] file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(246,217,203,0.42)] file:px-4 file:py-2 file:font-bold file:text-[color:var(--accent-dark)] hover:file:bg-[rgba(246,217,203,0.62)]" />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{t("public.tour_detail.review.fields.image_help")}</p>
                      {reviewErrors.image ? <span className="mt-2 block text-xs font-semibold text-rose-600">{reviewErrors.image}</span> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">{t("public.tour_detail.review.fields.name")}</span>
                      <input type="text" name="name" value={reviewForm.name} onChange={handleReviewChange} className="public-input w-full rounded-2xl px-4 py-3 text-sm" placeholder={t("public.tour_detail.review.fields.name_placeholder")} />
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
                      <textarea name="review" value={reviewForm.review} onChange={handleReviewChange} rows="6" className="public-input w-full rounded-2xl px-4 py-3 text-sm" placeholder={t("public.tour_detail.review.fields.review_placeholder")} />
                      {reviewErrors.review ? <span className="mt-2 block text-xs font-semibold text-rose-600">{reviewErrors.review}</span> : null}
                    </label>
                    <button type="submit" disabled={reviewSubmitting} className="public-btn-primary inline-flex rounded-full px-7 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70">{reviewSubmitting ? t("public.tour_detail.review.submitting") : t("public.tour_detail.review.submit")}</button>
                  </form>
                </section>
              </div>

              {related.length > 0 ? (
                <div className="mt-14">
                  <h2 className="public-heading mb-6 text-2xl font-extrabold">{t("public.tour_detail.related")}</h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {related.map((item) => (
                      <Link key={item.tourId} to={`/circuits/${item.tourId}`} className="public-panel group overflow-hidden rounded-3xl">
                        <img src={item.image} alt={item.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="p-4">
                          <h3 className="public-heading font-extrabold">{item.title}</h3>
                          <p className="text-sm text-[color:var(--muted)]">{item.departure}</p>
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
      {lightboxOpen && activeImage ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/88 p-4 sm:p-6" onClick={() => setLightboxOpen(false)}>
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-2xl font-light text-white transition hover:bg-white/20"
            aria-label="Close image preview"
          >
            ×
          </button>
          {tourImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToImage(activeImageIndex - 1);
                }}
                className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/20 sm:left-6 sm:h-14 sm:w-14"
                aria-label="Previous image"
              >
                <ArrowIcon direction="left" className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToImage(activeImageIndex + 1);
                }}
                className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/20 sm:right-6 sm:h-14 sm:w-14"
                aria-label="Next image"
              >
                <ArrowIcon direction="right" className="h-7 w-7" />
              </button>
            </>
          ) : null}
          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <img src={activeImage.image} alt={activeImage.caption || tour.title} className="max-h-[82vh] w-full rounded-3xl object-contain" />
            <div className="mt-4 flex items-start justify-between gap-4 text-white">
              <div>
                <p className="text-sm font-bold">{tour.title}</p>
                {activeImage.caption ? <p className="mt-1 text-sm text-white/75">{activeImage.caption}</p> : null}
              </div>
              {tourImages.length > 1 ? (
                <div className="rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                  {activeImageIndex + 1}/{tourImages.length}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <PublicFooter footerLinks={footerLinks} logo={platformMeta.logo} brand={platformMeta.brand} />
      <ScrollToTopButton />
    </div>
  );
}
