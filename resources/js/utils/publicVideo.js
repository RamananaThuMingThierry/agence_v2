function buildAssetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

export function mapPlatformVideoToPublicItem(video) {
  return {
    id: video?.id || null,
    encryptedId: video?.encrypted_id || null,
    title: video?.title || "",
    description: video?.description || "",
    sourceType: video?.source_type || "external",
    videoUrl: video?.video_url || "",
    videoPath: buildAssetUrl(video?.video_path),
    thumbnail: buildAssetUrl(video?.thumbnail),
    placement: video?.placement || "home",
    order: Number(video?.order || 0),
    isActive: Boolean(video?.is_active),
    relatedTour: video?.relatedTour ? {
      id: video.relatedTour.id || null,
      encryptedId: video.relatedTour.encrypted_id || null,
      title: video.relatedTour.title || "",
    } : null,
  };
}
