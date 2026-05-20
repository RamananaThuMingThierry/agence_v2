import React, { useEffect, useMemo, useState } from "react";
import { fetchPublicGalleries } from "../../api/galleries";
import { fetchPlatformSettings } from "../../api/platformSettings";
import GalleryPageSection from "../../components/public/GalleryPageSection";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import TopBar from "../../components/public/TopBar";
import { useI18n } from "../../hooks/admin/I18nContext";
import { mapGalleryToPublicItem } from "../../utils/publicGallery";

export default function GalleryListPage() {
  const { t } = useI18n();
  const [platformMeta, setPlatformMeta] = useState({
    logo: "/images/logo.png",
    brand: "World of Madagascar",
    tagline: t("public.home.meta.tagline"),
    topBarLeft: t("public.home.meta.topbar_left"),
    contact: "+261 38 09 137 03",
    whatsapp: "https://wa.me/261380913703",
    email: "worldofmadagascartour@gmail.com",
  });
  const [galleryItems, setGalleryItems] = useState([]);

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

    async function loadGalleries() {
      try {
        const galleries = await fetchPublicGalleries();

        if (!active || !Array.isArray(galleries)) return;

        setGalleryItems(galleries.map((gallery) => mapGalleryToPublicItem(gallery, t)));
      } catch {
        if (active) {
          setGalleryItems([]);
        }
      }
    }

    loadGalleries();

    return () => {
      active = false;
    };
  }, [t]);

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

  const galleryFilters = useMemo(() => {
    const categories = Array.from(new Set(galleryItems.map((item) => item.category).filter(Boolean)));
    return [t("public.gallery.list.filters.all"), ...categories];
  }, [galleryItems, t]);

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
      <GalleryPageSection filters={galleryFilters} items={galleryItems} />
      <PublicFooter footerLinks={footerLinks} logo={platformMeta.logo} brand={platformMeta.brand} facebook={platformMeta.facebook} instagram={platformMeta.instagram} whatsapp={platformMeta.whatsapp} />
      <ScrollToTopButton />
    </div>
  );
}
