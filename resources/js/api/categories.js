import axios from "axios";

export async function fetchCategories(params = {}) {
  const { data } = await axios.get("/api/categories", { params });
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchCategory(encryptedId) {
  const { data } = await axios.get(`/api/categories/${encryptedId}`);
  return data?.data ?? null;
}

export async function createCategory(values) {
  const { data } = await axios.post("/api/categories", {
    name: values.name ?? "",
    description: values.description ?? "",
    is_active: Boolean(values.is_active),
  });

  return data?.data ?? null;
}

export async function updateCategory(encryptedId, values) {
  const { data } = await axios.put(`/api/categories/${encryptedId}`, {
    name: values.name ?? "",
    description: values.description ?? "",
    is_active: Boolean(values.is_active),
  });

  return data?.data ?? null;
}

export async function deleteCategory(encryptedId) {
  return axios.delete(`/api/categories/${encryptedId}`);
}
