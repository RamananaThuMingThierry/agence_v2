import axios from "axios";

export async function fetchPublicPlatformVideos() {
  const { data } = await axios.get("/api/public/platform-videos");
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchPlatformVideos(params = {}) {
  const { data } = await axios.get("/api/platform-videos", { params });
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchPlatformVideo(encryptedId) {
  const { data } = await axios.get(`/api/platform-videos/${encryptedId}`);
  return data?.data ?? null;
}

export async function createPlatformVideo(values) {
  const payload = buildPlatformVideoFormData(values);
  const { data } = await axios.post("/api/platform-videos", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function updatePlatformVideo(encryptedId, values) {
  const payload = buildPlatformVideoFormData(values);
  payload.append("_method", "PUT");

  const { data } = await axios.post(`/api/platform-videos/${encryptedId}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function deletePlatformVideo(encryptedId) {
  return axios.delete(`/api/platform-videos/${encryptedId}`);
}

export async function restorePlatformVideo(encryptedId) {
  return axios.post(`/api/platform-videos/${encryptedId}/restore`);
}

export async function forceDeletePlatformVideo(encryptedId) {
  return axios.delete(`/api/platform-videos/${encryptedId}/force`);
}

function buildPlatformVideoFormData(values) {
  const payload = new FormData();
  payload.append("title", values.title ?? "");
  payload.append("description", values.description ?? "");
  payload.append("source_type", values.source_type ?? "external");
  payload.append("video_url", values.video_url ?? "");
  payload.append("tour_id", values.tour_id ? String(values.tour_id) : "");
  payload.append("placement", values.placement ?? "home");
  payload.append("order", String(values.order ?? 0));
  payload.append("is_active", values.is_active ? "1" : "0");

  if (values.video_file instanceof File) {
    payload.append("video_file", values.video_file);
  }

  if (values.thumbnail instanceof File) {
    payload.append("thumbnail", values.thumbnail);
  }

  return payload;
}
