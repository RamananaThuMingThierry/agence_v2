export function buildImageUrl(path) {
  if (!path) return "/images/profil.png";
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

export function getGalleryCover(gallery) {
  return gallery?.images?.find((image) => image.is_cover) || gallery?.images?.[0] || null;
}

export function mapGalleryToPublicItem(gallery) {
  const cover = getGalleryCover(gallery);

  return {
    id: gallery?.encrypted_id || gallery?.id || gallery?.title,
    galleryId: gallery?.encrypted_id || gallery?.id || null,
    title: gallery?.title || "Gallery",
    place: gallery?.place || gallery?.subtitle || gallery?.category?.name || "Madagascar",
    subtitle: gallery?.subtitle || "",
    description: gallery?.description || "",
    category: gallery?.category?.name || "Sans categorie",
    image: buildImageUrl(cover?.image_url),
    relatedTour: gallery?.tour ? {
      id: gallery.tour.encrypted_id || gallery.tour.id || null,
      title: gallery.tour.title || "",
      slug: gallery.tour.slug || "",
    } : null,
    images: Array.isArray(gallery?.images) ? gallery.images.map((image) => ({
      id: image.id,
      image: buildImageUrl(image.image_url),
      caption: image.caption || "",
      isCover: Boolean(image.is_cover),
    })) : [],
  };
}
