import React from "react";
import { useI18n } from "../../hooks/admin/I18nContext";

function getEmbedUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace(/^\/+/, "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const videoId = parsed.pathname.replace(/^\/+/, "");
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export default function TourVideosSection({ videos = [] }) {
  const { t } = useI18n();

  if (videos.length === 0) return null;

  return (
    <section className="mt-">
      <div className="public-panel rounded-xl p-6 md:p-8">
        <p className="public-eyebrow mb-2 text-sm font-bold uppercase">{t("public.tour_detail.videos.eyebrow")}</p>
        <h2 className="public-heading mb-3 text-2xl font-extrabold">{t("public.tour_detail.videos.title")}</h2>
        <p className="public-copy mb-8 leading-relaxed">{t("public.tour_detail.videos.text")}</p>
        <div className="grid gap-8 lg:grid-cols-1">
          {videos.map((video) => {
            const embedUrl = video.sourceType === "external" ? getEmbedUrl(video.videoUrl) : null;

            return (
              <article key={video.encryptedId || video.id} className="overflow-hidden rounded-xl border border-[rgba(125,94,78,0.12)] bg-white">
                <div className="aspect-video bg-stone-900">
                  {video.sourceType === "upload" && video.videoPath ? (
                    <video controls preload="metadata" poster={video.thumbnail || undefined} className="h-full w-full">
                      <source src={video.videoPath} />
                    </video>
                  ) : embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={video.title || t("public.tour_detail.videos.title")}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video controls preload="metadata" poster={video.thumbnail || undefined} className="h-full w-full">
                      <source src={video.videoUrl} />
                    </video>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="public-heading text-xl font-extrabold">{video.title || t("public.tour_detail.videos.card_title_fallback")}</h3>
                  <p className="public-copy mt-3 text-sm leading-relaxed">{video.description || t("public.tour_detail.videos.card_text_fallback")}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
