import axios from "axios";

export async function fetchPlatformSettings() {
  const { data } = await axios.get("/api/platform-settings");
  return data?.data ?? null;
}

export async function updatePlatformSettings(values) {
  const payload = new FormData();
  payload.append("_method", "PUT");
  payload.append("platform_name", values.platform_name ?? "");
  payload.append("contact", values.contact ?? "");
  payload.append("email", values.email ?? "");
  payload.append("address", values.address ?? "");

  if (values.logo instanceof File) {
    payload.append("logo", values.logo);
  }

  const { data } = await axios.post("/api/platform-settings", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data?.data ?? null;
}
