import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { fetchPublicPlatformVideos } from "../../api/platformVideos";
import MemoriesVideosSection from "../../components/public/MemoriesVideosSection";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import ScrollToTopButton from "../../components/public/ScrollToTopButton";
import TopBar from "../../components/public/TopBar";
import { useI18n } from "../../hooks/admin/I18nContext";
import { mapPlatformVideoToPublicItem } from "../../utils/publicVideo";

export default function VideosListPage() {
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
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

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

    async function loadVideos() {
      setLoading(true);

      try {
        const items = await fetchPublicPlatformVideos();
        if (!active) return;

        const mapped = Array.isArray(items) ? items.map((item) => mapPlatformVideoToPublicItem(item)) : [];
        setVideos(mapped);
      } catch {
        if (active) {
          setVideos([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadVideos();

    return () => {
      active = false;
    };
  }, []);

  const memoryVideos = videos.filter((video) => video.placement === "memory");

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
      <main className="public-main">
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4">
            {loading ? (
              <div className="public-panel rounded-xl px-6 py-12 text-center text-sm font-semibold text-[color:var(--muted)]">{t("public.home.memories.loading")}</div>
            ) : memoryVideos.length === 0 ? (
              <div className="rounded-xl px-6 py-20 text-center text-xl font-bold leading-relaxed text-[color:var(--accent-deep)] md:text-2xl">{t("public.home.memories.empty")}</div>
            ) : (
              <MemoriesVideosSection videos={memoryVideos} />
            )}
          </div>
        </section>
      </main>
      <PublicFooter footerLinks={footerLinks} logo={platformMeta.logo} brand={platformMeta.brand} facebook={platformMeta.facebook} instagram={platformMeta.instagram} whatsapp={platformMeta.whatsapp} />
      <ScrollToTopButton />
    </div>
  );
}
