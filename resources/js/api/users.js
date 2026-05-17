import axios from "axios";

export async function fetchUsers(params = {}) {
  const { data } = await axios.get("/api/users", { params });
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchUser(encryptedId) {
  const { data } = await axios.get(`/api/users/${encryptedId}`);
  return data?.data ?? null;
}

export async function createUser(values) {
  const payload = buildUserFormData(values);
  const { data } = await axios.post("/api/users", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? data ?? null;
}

export async function updateUser(encryptedId, values) {
  const payload = buildUserFormData(values);
  payload.append("_method", "PUT");

  const { data } = await axios.post(`/api/users/${encryptedId}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function deleteUser(encryptedId) {
  return axios.delete(`/api/users/${encryptedId}`);
}

export async function deleteAuthenticatedUser(password) {
  return axios.delete("/api/auth/account", {
    data: { password },
  });
}

export async function restoreUser(encryptedId) {
  return axios.post(`/api/users/${encryptedId}/restore`);
}

export async function forceDeleteUser(encryptedId) {
  return axios.delete(`/api/users/${encryptedId}/force`);
}

function buildUserFormData(values) {
  const payload = new FormData();
  payload.append("pseudo", values.pseudo ?? "");
  payload.append("email", values.email ?? "");
  payload.append("contact", values.contact ?? "");
  payload.append("address", values.address ?? "");

  if (values.role) {
    payload.append("role", values.role);
  }

  if (values.status) {
    payload.append("status", values.status);
  }

  if (values.password) {
    payload.append("password", values.password);
    payload.append("password_confirmation", values.password_confirmation ?? "");
  }

  if (values.avatar instanceof File) {
    payload.append("avatar", values.avatar);
  }

  return payload;
}
