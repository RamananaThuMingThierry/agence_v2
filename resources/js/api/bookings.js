import axios from "axios";

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
