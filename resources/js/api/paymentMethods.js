import axios from "axios";

export async function fetchPaymentMethods(params = {}) {
  const { data } = await axios.get("/api/payment-methods", { params });
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function createPaymentMethod(values) {
  const payload = buildPaymentMethodFormData(values);
  const { data } = await axios.post("/api/payment-methods", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function updatePaymentMethod(encryptedId, values) {
  const payload = buildPaymentMethodFormData(values);
  payload.append("_method", "PUT");

  const { data } = await axios.post(`/api/payment-methods/${encryptedId}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function deletePaymentMethod(encryptedId) {
  return axios.delete(`/api/payment-methods/${encryptedId}`);
}

function buildPaymentMethodFormData(values) {
  const payload = new FormData();
  payload.append("name", values.name ?? "");
  payload.append("code", values.code ?? "");
  payload.append("is_active", values.is_active ? "1" : "0");

  if (values.image instanceof File) {
    payload.append("image", values.image);
  }

  return payload;
}
