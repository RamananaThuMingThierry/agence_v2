import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPublicGallery, fetchPublicGalleries } from "../../api/galleries";
import { fetchPlatformSettings } from "../../api/platformSettings";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import TopBar from "../../components/public/TopBar";
import { useI18n } from "../../hooks/admin/I18nContext";
import { mapGalleryToPublicItem } from "../../utils/publicGallery";

function ArrowIcon({ direction = "left", className = "h-5 w-5" }) {
  const path = direction === "left" ? "M15 18 9 12l6-6" : "m9 18 6-6-6-6";

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default function GalleryDetailPage() {
  const { t } = useI18n();
  const { galleryId } = useParams();
  const [platformMeta, setPlatformMeta] = useState({
    logo: "/images/logo.png",
    brand: "World of Madagascar",
    tagline: t("public.home.meta.tagline"),
    topBarLeft: t("public.home.meta.topbar_left"),
    contact: "+261 38 09 137 03",
    whatsapp: "https://wa.me/261380913703",
    email: "worldofmadagascartour@gmail.com",
  });
  const [gallery, setGallery] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

    async function loadGallery() {
      setLoading(true);

      try {
        const [galleryItem, allItems] = await Promise.all([
          fetchPublicGallery(galleryId),
          fetchPublicGalleries(),
        ]);

        if (!active) return;

        const mappedGallery = galleryItem ? mapGalleryToPublicItem(galleryItem, t) : null;
        const mappedItems = Array.isArray(allItems) ? allItems.map((item) => mapGalleryToPublicItem(item, t)) : [];

        setGallery(mappedGallery);
        setRelated(
          mappedItems
            .filter((item) => Number(item.id || 0) !== Number(mappedGallery?.id || 0))
            .slice(0, 4),
        );
      } catch {
        if (active) {
          setGallery(null);
          setRelated([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadGallery();

    return () => {
      active = false;
    };
  }, [galleryId, t]);

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

  const coverImage = gallery?.images?.find((image) => image.isCover)?.image || gallery?.image;
  const galleryImages = gallery?.images?.length ? gallery.images : coverImage ? [{ id: "cover", image: coverImage, caption: gallery?.title || "", isCover: true }] : [];
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0] || null;

  useEffect(() => {
    setActiveImageIndex(0);
    setLightboxOpen(false);
  }, [galleryId, galleryImages.length]);

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
  }, [activeImageIndex, lightboxOpen, galleryImages.length]);

  function goToImage(nextIndex) {
    if (galleryImages.length === 0) return;
    const normalized = (nextIndex + galleryImages.length) % galleryImages.length;
    setActiveImageIndex(normalized);
  }

  function openLightbox(index) {
    setActiveImageIndex(index);
    setLightboxOpen(true);
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
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4">
          {loading ? (
            <div className="public-panel mt-10 rounded-3xl px-6 py-12 text-center text-sm font-semibold text-[color:var(--muted)]">{t("public.gallery.detail.loading")}</div>
          ) : !gallery ? (
            <div className="public-panel mt-10 rounded-3xl px-6 py-12 text-center text-sm font-semibold text-[color:var(--muted)]">{t("public.gallery.detail.not_found")}</div>
          ) : (
            <>
              <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px]">
                <div className="space-y-4">
                  <div className="public-panel relative overflow-hidden rounded-3xl">
                    {activeImage ? (
                      <button type="button" onClick={() => openLightbox(activeImageIndex)} className="block w-full text-left">
                        <img src={activeImage.image} alt={activeImage.caption || gallery.title} className="h-[320px] w-full object-cover sm:h-[460px] lg:h-[620px]" />
                      </button>
                    ) : null}
                    {galleryImages.length > 1 ? (
                      <>
                        <button type="button" onClick={() => goToImage(activeImageIndex - 1)} className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-[color:var(--accent-deep)] shadow-lg transition hover:bg-white sm:left-4 sm:h-12 sm:w-12">
                          <ArrowIcon direction="left" className="h-6 w-6" />
                        </button>
                        <button type="button" onClick={() => goToImage(activeImageIndex + 1)} className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-[color:var(--accent-deep)] shadow-lg transition hover:bg-white sm:right-4 sm:h-12 sm:w-12">
                          <ArrowIcon direction="right" className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-3 right-3 rounded-full bg-[rgba(38,24,21,0.78)] px-3 py-1 text-xs font-bold text-white sm:bottom-4 sm:right-4">
                          {t("public.gallery.detail.counter", { current: activeImageIndex + 1, total: galleryImages.length })}
                        </div>
                      </>
                    ) : null}
                  </div>

                  {activeImage?.caption ? (
                    <div className="public-panel rounded-3xl px-5 py-4">
                      <p className="text-sm font-semibold text-[color:var(--ink-soft)]">{activeImage.caption}</p>
                    </div>
                  ) : null}

                  {galleryImages.length > 1 ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 md:hidden">
                        {galleryImages.map((image, index) => (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => openLightbox(index)}
                            className={index === activeImageIndex ? "overflow-hidden rounded-3xl ring-4 ring-[color:var(--accent)]" : "overflow-hidden rounded-3xl opacity-95 transition hover:opacity-100"}
                          >
                            <img src={image.image} alt={image.caption || `${gallery.title} ${index + 1}`} className="h-36 w-full object-cover" />
                            <div className="bg-white px-4 py-3 text-left">
                              <p className="text-sm font-bold text-[color:var(--accent-deep)]">
                                {t("public.gallery.detail.counter", { current: index + 1, total: galleryImages.length })}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-[color:var(--muted)]">
                                {image.caption || gallery.title}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
                      {galleryImages.map((image, index) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => openLightbox(index)}
                          className={index === activeImageIndex ? "overflow-hidden rounded-2xl ring-4 ring-[color:var(--accent)]" : "overflow-hidden rounded-2xl opacity-80 transition hover:opacity-100"}
                        >
                          <img src={image.image} alt={image.caption || `${gallery.title} ${index + 1}`} className="h-28 w-full object-cover" />
                        </button>
                      ))}
                      </div>
                    </>
                  ) : null}
                </div>
                <aside className="public-panel h-fit rounded-3xl p-6">
                  <span className="rounded-full bg-[rgba(245,208,137,0.26)] px-3 py-1 text-xs font-bold text-[#855611]">{gallery.category}</span>
                  <h1 className="public-heading mb-3 mt-4 text-3xl font-extrabold">{gallery.title}</h1>
                  <p className="public-copy mb-6 leading-relaxed">{gallery.description || t("public.gallery.detail.description_fallback")}</p>

                  <div className="mb-6 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-[rgba(125,94,78,0.12)] pb-3">
                      <span>{t("public.gallery.detail.place")}</span>
                      <strong>{gallery.place || "-"}</strong>
                    </div>
                    <div className="flex justify-between border-b border-[rgba(125,94,78,0.12)] pb-3">
                      <span>{t("public.gallery.detail.category")}</span>
                      <strong>{gallery.category || "-"}</strong>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>{t("public.gallery.detail.related_tour")}</span>
                      <strong className="text-right">{gallery.relatedTour?.title || "-"}</strong>
                    </div>
                  </div>

                  <a href={gallery.relatedTour?.id ? `/circuits/${gallery.relatedTour.id}` : "/#tours"} className="public-btn-primary mb-3 block rounded-full py-4 text-center font-bold transition">
                    {t("public.gallery.detail.view_related_tour")}
                  </a>
                  <a href="/#contact" className="public-btn-secondary block rounded-full py-4 text-center font-bold transition">
                    {t("public.gallery.detail.request_trip")}
                  </a>
                </aside>
              </div>

              {related.length > 0 ? (
                <div className="mt-14">
                  <h2 className="public-heading mb-6 text-2xl font-extrabold">{t("public.gallery.detail.related")}</h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {related.map((item) => (
                      <Link key={item.galleryId} to={`/galerie/${item.galleryId}`} className="public-panel group overflow-hidden rounded-3xl">
                        <img src={item.image} alt={item.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="p-4">
                          <h3 className="public-heading font-extrabold">{item.title}</h3>
                          <p className="text-sm text-[color:var(--muted)]">{item.place}</p>
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
          {galleryImages.length > 1 ? (
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
            <img src={activeImage.image} alt={activeImage.caption || gallery.title} className="max-h-[82vh] w-full rounded-3xl object-contain" />
            <div className="mt-4 flex items-start justify-between gap-4 text-white">
              <div>
                <p className="text-sm font-bold">{gallery.title}</p>
                {activeImage.caption ? <p className="mt-1 text-sm text-white/75">{activeImage.caption}</p> : null}
              </div>
              {galleryImages.length > 1 ? (
                <div className="rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                  {t("public.gallery.detail.counter", { current: activeImageIndex + 1, total: galleryImages.length })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <PublicFooter footerLinks={footerLinks} logo={platformMeta.logo} brand={platformMeta.brand} facebook={platformMeta.facebook} instagram={platformMeta.instagram} whatsapp={platformMeta.whatsapp} />
      <ScrollToTopButton />
    </div>
  );
}
