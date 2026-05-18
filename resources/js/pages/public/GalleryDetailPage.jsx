import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPublicGallery, fetchPublicGalleries } from "../../api/galleries";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import TopBar from "../../components/public/TopBar";
import WhatsAppButton from "../../components/public/WhatsAppButton";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { contactLinks, footerLinks, navLinks, siteMeta } from "../../data/publicHomeData";
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
  const { galleryId } = useParams();
  const [platformMeta, setPlatformMeta] = useState(siteMeta);
  const [gallery, setGallery] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

    async function loadGallery() {
      setLoading(true);

      try {
        const [galleryItem, allItems] = await Promise.all([
          fetchPublicGallery(galleryId),
          fetchPublicGalleries(),
        ]);

        if (!active) return;

        const mappedGallery = galleryItem ? mapGalleryToPublicItem(galleryItem) : null;
        const mappedItems = Array.isArray(allItems) ? allItems.map(mapGalleryToPublicItem) : [];

        setGallery(mappedGallery);
        setRelated(mappedItems.filter((item) => item.galleryId !== galleryId).slice(0, 4));
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
  }, [galleryId]);

  const publicLinks = useMemo(
    () => navLinks.map((link) => ({
      ...link,
      href: link.href.startsWith("#") ? `/${link.href}` : link.href,
    })),
    [],
  );

  const coverImage = gallery?.images?.find((image) => image.isCover)?.image || gallery?.image;
  const galleryImages = gallery?.images?.length ? gallery.images : coverImage ? [{ id: "cover", image: coverImage, caption: gallery?.title || "", isCover: true }] : [];
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0] || null;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [galleryId, galleryImages.length]);

  function goToImage(nextIndex) {
    if (galleryImages.length === 0) return;
    const normalized = (nextIndex + galleryImages.length) % galleryImages.length;
    setActiveImageIndex(normalized);
  }

  return (
    <div className="bg-stone-50 text-slate-800">
      <TopBar leftText={platformMeta.topBarLeft} rightText={platformMeta.topBarRight} />
      <PublicHeader
        logo={platformMeta.logo}
        brand={platformMeta.brand}
        tagline={platformMeta.tagline}
        links={publicLinks}
        homeHref="/#home"
        contactHref="/#contact"
      />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          {loading ? (
            <div className="mt-10 rounded-3xl border border-stone-200 bg-stone-50 px-6 py-12 text-center text-sm font-semibold text-slate-500">Chargement de la gallery...</div>
          ) : !gallery ? (
            <div className="mt-10 rounded-3xl border border-stone-200 bg-stone-50 px-6 py-12 text-center text-sm font-semibold text-slate-500">Gallery introuvable.</div>
          ) : (
            <>
              <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px]">
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
                    {activeImage ? <img src={activeImage.image} alt={activeImage.caption || gallery.title} className="h-[620px] w-full object-cover" /> : null}
                    {galleryImages.length > 1 ? (
                      <>
                        <button type="button" onClick={() => goToImage(activeImageIndex - 1)} className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-lg transition hover:bg-white">
                          <ArrowIcon direction="left" className="h-6 w-6" />
                        </button>
                        <button type="button" onClick={() => goToImage(activeImageIndex + 1)} className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-lg transition hover:bg-white">
                          <ArrowIcon direction="right" className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold text-white">
                          {activeImageIndex + 1} / {galleryImages.length}
                        </div>
                      </>
                    ) : null}
                  </div>

                  {activeImage?.caption ? (
                    <div className="rounded-3xl bg-white px-5 py-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-700">{activeImage.caption}</p>
                    </div>
                  ) : null}

                  {galleryImages.length > 1 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {galleryImages.map((image, index) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={index === activeImageIndex ? "overflow-hidden rounded-2xl ring-4 ring-emerald-600" : "overflow-hidden rounded-2xl opacity-80 transition hover:opacity-100"}
                        >
                          <img src={image.image} alt={image.caption || `${gallery.title} ${index + 1}`} className="h-28 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{gallery.category}</span>
                  <h1 className="mb-3 mt-4 text-3xl font-extrabold text-slate-900">{gallery.title}</h1>
                  <p className="mb-6 leading-relaxed text-slate-600">{gallery.description || "Une image peut avoir sa propre page avec description, lieu, circuit associe et bouton pour demander le voyage correspondant."}</p>

                  <div className="mb-6 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-100 pb-3">
                      <span>Lieu</span>
                      <strong>{gallery.place || "-"}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-3">
                      <span>Categorie</span>
                      <strong>{gallery.category || "-"}</strong>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Circuit lie</span>
                      <strong className="text-right">{gallery.relatedTour?.title || "-"}</strong>
                    </div>
                  </div>

                  <a href="/#all-tours" className="mb-3 block rounded-full bg-emerald-700 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-800">
                    Voir le circuit lie
                  </a>
                  <a href="/#contact" className="block rounded-full border border-emerald-700 py-4 text-center font-bold text-emerald-700 transition hover:bg-emerald-50">
                    Demander ce voyage
                  </a>
                </aside>
              </div>

              {related.length > 0 ? (
                <div className="mt-14">
                  <h2 className="mb-6 text-2xl font-extrabold text-slate-900">Autres galleries</h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {related.map((item) => (
                      <Link key={item.galleryId} to={`/galerie/${item.galleryId}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm">
                        <img src={item.image} alt={item.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="p-4">
                          <h3 className="font-extrabold">{item.title}</h3>
                          <p className="text-sm text-slate-500">{item.place}</p>
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
      <PublicFooter footerLinks={footerLinks} contactLinks={contactLinks} />
      <WhatsAppButton href="/#contact" />
    </div>
  );
}
