import { formatUsd } from "./currency";

export function buildImageUrl(path) {
  if (!path) return "/images/profil.png";
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

export function getTourCover(tour) {
  return tour?.images?.find((image) => image.is_cover) || tour?.images?.[0] || null;
}

export function mapTourToPublicItem(tour, t = null) {
  const cover = getTourCover(tour);
  const description = tour?.description || "";
  const fallbackTitle = typeof t === "function" ? t("public.tours.fallbacks.title") : "Tour";
  const fallbackCategory = typeof t === "function" ? t("public.tours.fallbacks.category") : "Tour";
  const fallbackTraveler = typeof t === "function" ? t("public.tours.fallbacks.traveler") : "Traveler";

  return {
    id: tour?.id || null,
    encryptedId: tour?.encrypted_id || null,
    tourId: tour?.encrypted_id || tour?.id || null,
    title: tour?.title || fallbackTitle,
    description,
    excerpt: description.length > 180 ? `${description.slice(0, 177)}...` : description,
    image: buildImageUrl(cover?.image_url),
    category: tour?.category || fallbackCategory,
    categoryTone: tour?.category,
    duration: tour?.duration || "-",
    price: Number(tour?.price || 0),
    formattedPrice: formatUsd(tour?.price || 0, "fr-FR"),
    departure: tour?.start_location || "-",
    arrival: tour?.end_location || "-",
    programs: Array.isArray(tour?.programs) ? tour.programs : [],
    inclusions: Array.isArray(tour?.inclusions) ? tour.inclusions : [],
    exclusions: Array.isArray(tour?.exclusions) ? tour.exclusions : [],
    images: Array.isArray(tour?.images) ? tour.images.map((image) => ({
      id: image.id,
      image: buildImageUrl(image.image_url),
      caption: image.caption || "",
      isCover: Boolean(image.is_cover),
    })) : [],
    reviews: Array.isArray(tour?.reviews) ? tour.reviews.map((review) => ({
      id: review.id,
      name: review.name || fallbackTraveler,
      rating: Number(review.rating || 5),
      review: review.review || "",
      image: buildImageUrl(review.image),
      createdAt: review.created_at || null,
    })) : [],
    videos: Array.isArray(tour?.videos) ? tour.videos.map((video) => ({
      id: video.id || null,
      encryptedId: video.encrypted_id || null,
      title: video.title || "",
      description: video.description || "",
      sourceType: video.source_type || "external",
      videoUrl: video.video_url || "",
      videoPath: video.video_path ? `/${String(video.video_path).replace(/^\/+/, "")}` : "",
      thumbnail: video.thumbnail ? `/${String(video.thumbnail).replace(/^\/+/, "")}` : "",
      placement: video.placement || "home",
      order: Number(video.order || 0),
      isActive: Boolean(video.is_active),
    })) : [],
  };
}
