import axios from "axios";

export async function fetchPublicSlides() {
  const { data } = await axios.get("/api/public/slides");
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchSlides(params = {}) {
  const { data } = await axios.get("/api/slides", { params });
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchSlide(encryptedId) {
  const { data } = await axios.get(`/api/slides/${encryptedId}`);
  return data?.data ?? null;
}

export async function createSlide(values) {
  const payload = buildSlideFormData(values);
  const { data } = await axios.post("/api/slides", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function updateSlide(encryptedId, values) {
  const payload = buildSlideFormData(values);
  payload.append("_method", "PUT");

  const { data } = await axios.post(`/api/slides/${encryptedId}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function deleteSlide(encryptedId) {
  return axios.delete(`/api/slides/${encryptedId}`);
}

export async function restoreSlide(encryptedId) {
  return axios.post(`/api/slides/${encryptedId}/restore`);
}

export async function forceDeleteSlide(encryptedId) {
  return axios.delete(`/api/slides/${encryptedId}/force`);
}

function buildSlideFormData(values) {
  const payload = new FormData();
  payload.append("title", values.title ?? "");
  payload.append("subtitle", values.subtitle ?? "");
  payload.append("description", values.description ?? "");
  payload.append("order", String(values.order ?? 0));
  payload.append("is_active", values.is_active ? "1" : "0");

  if (values.image instanceof File) {
    payload.append("image", values.image);
  }

  return payload;
}
