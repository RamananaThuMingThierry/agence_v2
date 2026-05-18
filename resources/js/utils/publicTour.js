export function buildImageUrl(path) {
  if (!path) return "/images/profil.png";
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

export function getTourCover(tour) {
  return tour?.images?.find((image) => image.is_cover) || tour?.images?.[0] || null;
}

export function getTourTone(category = "") {
  const value = String(category).toLowerCase();

  if (value.includes("nature") || value.includes("wildlife")) return "bg-emerald-100 text-emerald-800";
  if (value.includes("aventure") || value.includes("adventure")) return "bg-amber-100 text-amber-800";
  if (value.includes("classique") || value.includes("classic")) return "bg-sky-100 text-sky-800";
  if (value.includes("plage") || value.includes("beach")) return "bg-cyan-100 text-cyan-800";
  return "bg-stone-100 text-slate-700";
}

export function mapTourToPublicItem(tour) {
  const cover = getTourCover(tour);
  const description = tour?.description || "";

  return {
    id: tour?.id || null,
    encryptedId: tour?.encrypted_id || null,
    tourId: tour?.encrypted_id || tour?.id || null,
    title: tour?.title || "Tour",
    description,
    excerpt: description.length > 180 ? `${description.slice(0, 177)}...` : description,
    image: buildImageUrl(cover?.image_url),
    category: tour?.category || "Circuit",
    categoryTone: getTourTone(tour?.category),
    duration: tour?.duration || "-",
    price: Number(tour?.price || 0),
    formattedPrice: Number(tour?.price || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
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
      name: review.name || "Voyageur",
      rating: Number(review.rating || 5),
      review: review.review || "",
      image: buildImageUrl(review.image),
      createdAt: review.created_at || null,
    })) : [],
  };
}
