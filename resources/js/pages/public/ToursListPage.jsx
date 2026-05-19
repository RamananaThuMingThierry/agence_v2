import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { fetchPublicTours } from "../../api/tours";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import SectionTitle from "../../components/public/SectionTitle";
import TopBar from "../../components/public/TopBar";
import { useI18n } from "../../hooks/admin/I18nContext";
import { mapTourToPublicItem } from "../../utils/publicTour";

function TourCard({ tour, t }) {
  return (
    <article className="public-panel overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(89,44,30,0.16)]">
      <img src={tour.image} alt={tour.title} className="h-60 w-full object-cover" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${tour.categoryTone}`}>{tour.category}</span>
          <span className="font-bold text-[color:var(--accent-deep)]">{tour.duration}</span>
        </div>
        <h2 className="public-heading mb-3 text-xl font-extrabold">{tour.title}</h2>
        <p className="public-copy mb-5 text-sm leading-relaxed">{tour.excerpt || t("public.tours_list.description_coming")}</p>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">{t("public.tours_list.departure")}</p>
            <p className="text-sm font-semibold text-[color:var(--ink-soft)]">{tour.departure}</p>
          </div>
          <p className="public-price text-2xl font-extrabold">{tour.formattedPrice}</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/circuits/${tour.tourId}`} className="public-btn-primary flex-1 rounded-full py-3 text-center font-bold transition">
            {t("public.common.view_more")}
          </Link>
          <Link to={`/reservations/${tour.tourId}`} className="public-btn-secondary flex-1 rounded-full py-3 text-center font-bold transition">
            {t("public.common.book")}
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatPrice(price, lang) {
  const localeMap = { fr: "fr-FR", en: "en-GB", es: "es-ES", de: "de-DE" };
  return Number(price || 0).toLocaleString(localeMap[lang] || "fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default function ToursListPage() {
  const { t, lang } = useI18n();
  const [platformMeta, setPlatformMeta] = useState({
    logo: "/images/logo.png",
    brand: "World of Madagascar",
    tagline: t("public.home.meta.tagline"),
    topBarLeft: t("public.home.meta.topbar_left"),
    contact: "+261 38 09 137 03",
    whatsapp: "https://wa.me/261380913703",
    email: "worldofmadagascartour@gmail.com",
  });
  const [tours, setTours] = useState([]);

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

    async function loadTours() {
      try {
        const items = await fetchPublicTours();

        if (!active || !Array.isArray(items)) return;

        setTours(
          items.map((tour) => mapTourToPublicItem(tour, t)).map((item) => ({
            ...item,
            formattedPrice: formatPrice(item.price, lang),
          })),
        );
      } catch {
        if (active) {
          setTours([]);
        }
      }
    }

    loadTours();

    return () => {
      active = false;
    };
  }, [lang, t]);

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

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle
            eyebrow={t("public.tours_list.eyebrow")}
            title={t("public.tours_list.title")}
            text={t("public.tours_list.text")}
          />

          {tours.length === 0 ? (
            <div className="public-panel mt-12 rounded-3xl px-6 py-12 text-center text-sm font-semibold text-[color:var(--muted)]">
              {t("public.tours_list.empty")}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.tourId || tour.id || tour.title} tour={tour} t={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      <PublicFooter footerLinks={footerLinks} logo={platformMeta.logo} brand={platformMeta.brand} />
      <ScrollToTopButton />
    </div>
  );
}
