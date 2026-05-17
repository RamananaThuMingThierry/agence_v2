import axios from "axios";

export async function fetchPublishedTestimonials() {
  const { data } = await axios.get("/api/public/testimonials");
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchTestimonials(params = {}) {
  const { data } = await axios.get("/api/testimonials", { params });
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchTestimonial(encryptedId) {
  const { data } = await axios.get(`/api/testimonials/${encryptedId}`);
  return data?.data ?? null;
}

export async function createTestimonial(values) {
  const payload = buildTestimonialFormData(values);
  const { data } = await axios.post("/api/testimonials", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function updateTestimonial(encryptedId, values) {
  const payload = buildTestimonialFormData(values);
  payload.append("_method", "PUT");

  const { data } = await axios.post(`/api/testimonials/${encryptedId}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function deleteTestimonial(encryptedId) {
  return axios.delete(`/api/testimonials/${encryptedId}`);
}

export async function restoreTestimonial(encryptedId) {
  return axios.post(`/api/testimonials/${encryptedId}/restore`);
}

export async function forceDeleteTestimonial(encryptedId) {
  return axios.delete(`/api/testimonials/${encryptedId}/force`);
}

function buildTestimonialFormData(values) {
  const payload = new FormData();
  payload.append("name", values.name ?? "");
  payload.append("message", values.message ?? "");
  payload.append("rating", String(values.rating ?? 5));
  payload.append("status", values.status ?? "publish");

  if (values.image instanceof File) {
    payload.append("image", values.image);
  }

  return payload;
}
