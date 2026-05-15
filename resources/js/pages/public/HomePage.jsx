import React from "react";
import ContactSection from "../../components/public/ContactSection";
import CustomTripCtaSection from "../../components/public/CustomTripCtaSection";
import FeaturedToursSection from "../../components/public/FeaturedToursSection";
import GalleryPageSection from "../../components/public/GalleryPageSection";
import GalleryPreviewSection from "../../components/public/GalleryPreviewSection";
import HeroSection from "../../components/public/HeroSection";
import PaymentMethodsSection from "../../components/public/PaymentMethodsSection";
import PhotoDetailSection from "../../components/public/PhotoDetailSection";
import PublicFooter from "../../components/public/PublicFooter";
import PublicHeader from "../../components/public/PublicHeader";
import ReviewsSection from "../../components/public/ReviewsSection";
import TopBar from "../../components/public/TopBar";
import TourDetailPreviewSection from "../../components/public/TourDetailPreviewSection";
import ToursCatalogSection from "../../components/public/ToursCatalogSection";
import TrustStatsSection from "../../components/public/TrustStatsSection";
import WhatsAppButton from "../../components/public/WhatsAppButton";
import WhyChooseSection from "../../components/public/WhyChooseSection";
import {
  allTours,
  contactLinks,
  customTrips,
  featuredTours,
  footerLinks,
  galleryFilters,
  galleryFull,
  galleryPreview,
  hero,
  highlights,
  navLinks,
  paymentMethods,
  photoRelated,
  reasons,
  siteMeta,
  testimonials,
} from "../../data/publicHomeData";

export default function HomePage() {
  return (
    <div className="bg-stone-50 text-slate-800">
      <TopBar leftText={siteMeta.topBarLeft} rightText={siteMeta.topBarRight} />
      <PublicHeader
        logo={siteMeta.logo}
        brand={siteMeta.brand}
        tagline={siteMeta.tagline}
        links={navLinks}
      />
      <HeroSection hero={hero} />
      <TrustStatsSection items={highlights} />
      <WhyChooseSection items={reasons} />
      <FeaturedToursSection tours={featuredTours} />
      <ToursCatalogSection tours={allTours} />
      <GalleryPreviewSection items={galleryPreview} />
      <TourDetailPreviewSection paymentMethods={paymentMethods} />
      <GalleryPageSection filters={galleryFilters} items={galleryFull} />
      <PhotoDetailSection relatedPhotos={photoRelated} />
      <PaymentMethodsSection methods={paymentMethods} />
      <CustomTripCtaSection trips={customTrips} />
      <ReviewsSection testimonials={testimonials} />
      <ContactSection />
      <PublicFooter footerLinks={footerLinks} contactLinks={contactLinks} />
      <WhatsAppButton />
    </div>
  );
}
