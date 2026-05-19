import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/admin/I18nContext";

function buildAssetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

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

export default function PlatformVideoSection({ videos = [] }) {
  const { t } = useI18n();

  const featuredVideo = useMemo(
    () => videos.find((item) => item?.placement === "home" && item?.isActive && !item?.relatedTour) || videos.find((item) => item?.placement === "home" && item?.isActive) || null,
    [videos],
  );

  const embedUrl = featuredVideo?.sourceType === "external" ? getEmbedUrl(featuredVideo.videoUrl) : null;
  const uploadUrl = featuredVideo?.sourceType === "upload" ? buildAssetUrl(featuredVideo.videoPath) : "";
  const fallbackExternalUrl = featuredVideo?.sourceType === "external" ? featuredVideo.videoUrl || "" : "";
  const thumbnailUrl = buildAssetUrl(featuredVideo?.thumbnail);

  if (!featuredVideo) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 max-w-3xl">
          <p className="public-eyebrow mb-3 text-sm font-bold uppercase">{t("public.home.video.eyebrow")}</p>
          <h2 className="public-heading text-3xl font-extrabold md:text-4xl">{featuredVideo.title || t("public.home.video.title")}</h2>
          <p className="public-copy mt-4 text-base leading-relaxed">{featuredVideo.description || t("public.home.video.text")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <div className="public-panel overflow-hidden rounded-xl">
            <div className="relative aspect-video bg-stone-900">
              {featuredVideo.sourceType === "upload" && uploadUrl ? (
                <video
                  controls
                  preload="metadata"
                  poster={thumbnailUrl || undefined}
                  className="h-full w-full"
                >
                  <source src={uploadUrl} />
                </video>
              ) : embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={featuredVideo.title || t("public.home.video.title")}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : fallbackExternalUrl ? (
                <video
                  controls
                  preload="metadata"
                  poster={thumbnailUrl || undefined}
                  className="h-full w-full"
                >
                  <source src={fallbackExternalUrl} />
                </video>
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-white/70">
                  {t("public.home.video.unavailable")}
                </div>
              )}
            </div>
          </div>

          <aside className="public-panel rounded-xl p-6 md:p-8">
            <h3 className="public-heading text-2xl font-extrabold">{t("public.home.video.sidebar_title")}</h3>
            <p className="public-copy mt-4 leading-relaxed">{t("public.home.video.sidebar_text")}</p>
            <div className="mt-6 grid gap-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="rounded-xl bg-[rgba(246,217,203,0.26)] px-4 py-4 text-sm font-semibold text-[color:var(--ink-soft)]">
                  {t(`public.home.video.points.${index}`)}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link to="/videos" className="public-btn-secondary inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition">
                {t("public.home.memories.view_all")}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
