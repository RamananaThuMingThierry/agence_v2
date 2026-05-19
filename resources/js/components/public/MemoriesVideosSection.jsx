import React from "react";
import { Link } from "react-router-dom";
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

function MemoryVideoCard({ video }) {
  const { t } = useI18n();
  const embedUrl = video.sourceType === "external" ? getEmbedUrl(video.videoUrl) : null;

  return (
    <article className="public-panel overflow-hidden rounded-xl border border-[rgba(125,94,78,0.12)] bg-white">
      <div className="aspect-video bg-stone-900">
        {video.sourceType === "upload" && video.videoPath ? (
          <video controls preload="metadata" poster={video.thumbnail || undefined} className="h-full w-full">
            <source src={video.videoPath} />
          </video>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            title={video.title || t("public.home.memories.title")}
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
      <div className="p-6">
        <h3 className="public-heading text-xl font-extrabold">{video.title || t("public.home.memories.card_title_fallback")}</h3>
        <p className="public-copy mt-3 text-sm leading-relaxed">{video.description || t("public.home.memories.card_text_fallback")}</p>
        {video.relatedTour?.encryptedId ? (
          <Link to={`/circuits/${video.relatedTour.encryptedId}`} className="public-btn-secondary mt-5 inline-flex rounded-full px-5 py-3 text-sm font-bold transition">
            {t("public.home.memories.view_related_tour")}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default function MemoriesVideosSection({ videos = [] }) {
  const { t } = useI18n();

  if (videos.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="public-eyebrow mb-3 text-sm font-bold uppercase">{t("public.home.memories.eyebrow")}</p>
            <h2 className="public-heading text-3xl font-extrabold md:text-4xl">{t("public.home.memories.title")}</h2>
            <p className="public-copy mt-4 leading-relaxed">{t("public.home.memories.text")}</p>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {videos.map((video) => <MemoryVideoCard key={video.encryptedId || video.id || `${video.title}-${video.order}`} video={video} />)}
        </div>
        <div className="mt-8 md:hidden">
          <Link to="/videos" className="public-btn-secondary flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition">
            {t("public.home.memories.view_all")}
          </Link>
        </div>
      </div>
    </section>
  );
}
