import axios from "axios";

export async function fetchContactForms(params = {}) {
  const { data } = await axios.get("/api/contact-forms", { params });
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchContactForm(encryptedId) {
  const { data } = await axios.get(`/api/contact-forms/${encryptedId}`);
  return data?.data ?? null;
}

export async function deleteContactForm(encryptedId) {
  return axios.delete(`/api/contact-forms/${encryptedId}`);
}
