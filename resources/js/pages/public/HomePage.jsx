import React, { useEffect, useState } from "react";
import { fetchPublicGalleries } from "../../api/galleries";
import { fetchPlatformSettings } from "../../api/platformSettings";
import { fetchPublicSlides } from "../../api/slides";
import { fetchPublishedTestimonials } from "../../api/testimonials";
import { fetchPublicTours } from "../../api/tours";
import AboutSection from "../../components/public/AboutSection";
import ContactSection from "../../components/public/ContactSection";
import CustomTripCtaSection from "../../components/public/CustomTripCtaSection";
import FeaturedToursSection from "../../components/public/FeaturedToursSection";
import GalleryPreviewSection from "../../components/public/GalleryPreviewSection";
import HeroSection from "../../components/public/HeroSection";
import LocationMapSection from "../../components/public/LocationMapSection";
import PaymentMethodsSection from "../../components/public/PaymentMethodsSection";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import TestimonialsSection from "../../components/public/TestimonialsSection";
import TopBar from "../../components/public/TopBar";
import ToursCatalogSection from "../../components/public/ToursCatalogSection";
import TrustStatsSection from "../../components/public/TrustStatsSection";
import WhatsAppButton from "../../components/public/WhatsAppButton";
import WhyChooseSection from "../../components/public/WhyChooseSection";
import {
  aboutFounder,
  contactLinks,
  customTrips,
  fallbackTestimonials,
  footerLinks,
  hero,
  highlights,
  navLinks,
  paymentMethods,
  reasons,
  siteMeta,
} from "../../data/publicHomeData";
import { officeLocation } from "../../data/publicLocationData";
import { mapGalleryToPublicItem } from "../../utils/publicGallery";
import { mapTourToPublicItem } from "../../utils/publicTour";

export default function HomePage() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [platformMeta, setPlatformMeta] = useState(siteMeta);
  const [slides, setSlides] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [featuredTours, setFeaturedTours] = useState([]);
  const [allTours, setAllTours] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadTestimonials() {
      try {
        const items = await fetchPublishedTestimonials();

        if (!active || !Array.isArray(items) || items.length === 0) {
          return;
        }

        setTestimonials(items.slice(0, 3));
      } catch {
        if (active) {
          setTestimonials(fallbackTestimonials.slice(0, 3));
        }
      }
    }

    loadTestimonials();

    return () => {
      active = false;
    };
  }, []);

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

    async function loadSlides() {
      try {
        const items = await fetchPublicSlides();

        if (!active || !Array.isArray(items)) return;

        setSlides(items);
      } catch {
        if (active) {
          setSlides([]);
        }
      }
    }

    loadSlides();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadGalleries() {
      try {
        const items = await fetchPublicGalleries();

        if (!active || !Array.isArray(items)) return;

        setGalleryPreview(items.map(mapGalleryToPublicItem).slice(0, 4));
      } catch {
        if (active) {
          setGalleryPreview([]);
        }
      }
    }

    loadGalleries();

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

        const mappedTours = items.map(mapTourToPublicItem);
        setAllTours(mappedTours);
        setFeaturedTours(mappedTours.slice(0, 3));
      } catch {
        if (active) {
          setAllTours([]);
          setFeaturedTours([]);
        }
      }
    }

    loadTours();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-stone-50 text-slate-800">
      <TopBar leftText={platformMeta.topBarLeft} rightText={platformMeta.topBarRight} />
      <PublicHeader
        logo={platformMeta.logo}
        brand={platformMeta.brand}
        tagline={platformMeta.tagline}
        links={navLinks}
      />
      <HeroSection hero={hero} slides={slides} />
      <TrustStatsSection items={highlights} />
      <AboutSection founder={aboutFounder} />
      <WhyChooseSection items={reasons} />
      <FeaturedToursSection tours={featuredTours} />
      <ToursCatalogSection tours={allTours} />
      <GalleryPreviewSection items={galleryPreview} />
      <PaymentMethodsSection methods={paymentMethods} />
      <CustomTripCtaSection trips={customTrips} />
      <TestimonialsSection testimonials={testimonials} showMoreHref="/avis" />
      <ContactSection />
      <LocationMapSection location={officeLocation} />
      <PublicFooter footerLinks={footerLinks} contactLinks={contactLinks} />
      <WhatsAppButton />
    </div>
  );
}
