import React, { useEffect, useMemo, useState } from "react";
import { fetchPublicGalleries } from "../../api/galleries";
import GalleryPageSection from "../../components/public/GalleryPageSection";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import TopBar from "../../components/public/TopBar";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import { fetchPlatformSettings } from "../../api/platformSettings";
import {
  contactLinks,
  footerLinks,
  navLinks,
  siteMeta,
} from "../../data/publicHomeData";
import { mapGalleryToPublicItem } from "../../utils/publicGallery";

export default function GalleryListPage() {
  const [platformMeta, setPlatformMeta] = useState(siteMeta);
  const [galleryItems, setGalleryItems] = useState([]);

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

    async function loadGalleries() {
      try {
        const galleries = await fetchPublicGalleries();

        if (!active || !Array.isArray(galleries)) return;

        setGalleryItems(galleries.map(mapGalleryToPublicItem));
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
  }, []);

  const publicLinks = useMemo(
    () => navLinks.map((link) => ({
      ...link,
      href: link.href.startsWith("#") ? `/${link.href}` : link.href,
    })),
    [],
  );

  const galleryFilters = useMemo(() => {
    const categories = Array.from(new Set(galleryItems.map((item) => item.category).filter(Boolean)));
    return ["Tous", ...categories];
  }, [galleryItems]);

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
      <GalleryPageSection filters={galleryFilters} items={galleryItems} />
      <PublicFooter footerLinks={footerLinks} contactLinks={contactLinks} logo={platformMeta.logo} brand={platformMeta.brand} />
      <ScrollToTopButton />
    </div>
  );
}
