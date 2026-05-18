import axios from "axios";

export async function createPublicBooking(values) {
  const { data } = await axios.post("/api/public/bookings", values);

  return {
    booking: data?.data ?? null,
    message: data?.message ?? "",
    notifications: data?.notifications ?? {},
    whatsappUrl: data?.whatsapp_url ?? "",
  };
}

export async function fetchBookings(params = {}) {
  const { data } = await axios.get("/api/bookings", { params });
  return Array.isArray(data?.data) ? data.data : data?.data?.data || [];
}

export async function fetchBooking(encryptedId) {
  const { data } = await axios.get(`/api/bookings/${encryptedId}`);
  return data?.data ?? null;
}

export async function updateBooking(encryptedId, values) {
  const { data } = await axios.put(`/api/bookings/${encryptedId}`, values);
  return data?.data ?? null;
}

export async function deleteBooking(encryptedId) {
  return axios.delete(`/api/bookings/${encryptedId}`);
}
