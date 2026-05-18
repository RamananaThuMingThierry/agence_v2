import axios from "axios";

export async function fetchPublicGalleries() {
  const { data } = await axios.get("/api/public/galleries");
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchPublicGallery(encryptedId) {
  const { data } = await axios.get(`/api/public/galleries/${encryptedId}`);
  return data?.data ?? null;
}

export async function fetchGalleries(params = {}) {
  const { data } = await axios.get("/api/galleries", { params });
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchGallery(encryptedId) {
  const { data } = await axios.get(`/api/galleries/${encryptedId}`);
  return data?.data ?? null;
}

export async function createGallery(values) {
  const payload = buildGalleryFormData(values);
  const { data } = await axios.post("/api/galleries", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function updateGallery(encryptedId, values) {
  const payload = buildGalleryFormData(values);
  payload.append("_method", "PUT");

  const { data } = await axios.post(`/api/galleries/${encryptedId}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function deleteGallery(encryptedId) {
  return axios.delete(`/api/galleries/${encryptedId}`);
}

function buildGalleryFormData(values) {
  const payload = new FormData();
  payload.append("title", values.title ?? "");
  payload.append("subtitle", values.subtitle ?? "");
  payload.append("place", values.place ?? "");
  payload.append("description", values.description ?? "");
  payload.append("status", values.status ?? "publish");
  payload.append("category_id", String(values.category_id ?? ""));
  payload.append("tour_id", values.tour_id ? String(values.tour_id) : "");

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

  return payload;
}
