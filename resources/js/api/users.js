import axios from "axios";

export async function updateUser(encryptedId, values) {
  const payload = new FormData();
  payload.append("_method", "PUT");
  payload.append("pseudo", values.pseudo ?? "");
  payload.append("email", values.email ?? "");
  payload.append("contact", values.contact ?? "");
  payload.append("address", values.address ?? "");

  if (values.password) {
    payload.append("password", values.password);
    payload.append("password_confirmation", values.password_confirmation ?? "");
  }

  if (values.avatar instanceof File) {
    payload.append("avatar", values.avatar);
  }

  const { data } = await axios.post(`/api/users/${encryptedId}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}

export async function deleteUser(encryptedId) {
  return axios.delete(`/api/users/${encryptedId}`);
}
