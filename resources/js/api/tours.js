import axios from "axios";

export async function fetchPublicTours() {
  const { data } = await axios.get("/api/public/tours");
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchPublicTour(encryptedId) {
  const { data } = await axios.get(`/api/public/tours/${encryptedId}`);
  return data?.data ?? null;
}

export async function createPublicTourReview(encryptedId, values) {
  const payload = new FormData();
  payload.append("name", values.name ?? "");
  payload.append("rating", String(values.rating ?? 5));
  payload.append("review", values.review ?? "");

  if (values.image instanceof File) {
    payload.append("image", values.image);
  }

  const { data } = await axios.post(`/api/public/tours/${encryptedId}/reviews`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    review: data?.data ?? null,
    message: data?.message ?? "",
  };
}

export async function fetchTours(params = {}) {
  const { data } = await axios.get("/api/tours", { params });
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchTour(encryptedId) {
  const { data } = await axios.get(`/api/tours/${encryptedId}`);
  return data?.data ?? null;
}

export async function updateTourReview(tourEncryptedId, reviewId, values) {
  const { data } = await axios.put(`/api/tours/${tourEncryptedId}/reviews/${reviewId}`, values);
  return data?.data ?? null;
}

export async function deleteTourReview(tourEncryptedId, reviewId) {
  return axios.delete(`/api/tours/${tourEncryptedId}/reviews/${reviewId}`);
}

export async function createTour(values) {
  const payload = buildTourFormData(values);
  const { data } = await axios.post("/api/tours", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function updateTour(encryptedId, values) {
  const payload = buildTourFormData(values);
  payload.append("_method", "PUT");

  const { data } = await axios.post(`/api/tours/${encryptedId}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function deleteTour(encryptedId) {
  return axios.delete(`/api/tours/${encryptedId}`);
}

export async function restoreTour(encryptedId) {
  return axios.post(`/api/tours/${encryptedId}/restore`);
}

export async function forceDeleteTour(encryptedId) {
  return axios.delete(`/api/tours/${encryptedId}/force`);
}

function buildTourFormData(values) {
  const payload = new FormData();
  payload.append("title", values.title ?? "");
  payload.append("description", values.description ?? "");
  payload.append("slug", values.slug ?? "");
  payload.append("price", String(values.price ?? 0));
  payload.append("duration", values.duration ?? "");
  payload.append("category", values.category ?? "");
  payload.append("start_location", values.start_location ?? "");
  payload.append("end_location", values.end_location ?? "");
  payload.append("status", values.status ?? "inactive");

  (values.newImages ?? []).forEach((file, index) => {
    if (file instanceof File) {
      payload.append(`images[${index}]`, file);
      payload.append(`captions[${index}]`, values.newCaptions?.[index] ?? "");
    }
  });

  payload.append(
    "existing_images",
    JSON.stringify(
      (values.existingImages ?? []).map((image) => ({
        id: image.id,
        caption: image.caption ?? "",
      })),
    ),
  );
  payload.append("removed_image_ids", JSON.stringify(values.removedImageIds ?? []));

  if (values.coverSelection?.type === "existing") {
    payload.append("cover_image_id", String(values.coverSelection.value));
  }

  if (values.coverSelection?.type === "new") {
    payload.append("cover_new_index", String(values.coverSelection.value));
  }

  payload.append("programs", JSON.stringify(values.programs ?? []));
  payload.append("inclusions", JSON.stringify(values.inclusions ?? []));
  payload.append("exclusions", JSON.stringify(values.exclusions ?? []));

  return payload;
}
