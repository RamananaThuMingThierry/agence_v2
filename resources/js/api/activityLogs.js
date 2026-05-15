import axios from "axios";

export async function fetchActivityLogs(params = {}) {
  const { data } = await axios.get("/api/activity-logs", { params });

  if (Array.isArray(data?.data)) {
    return {
      items: data.data,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: data.data.length || params.per_page || 10,
        total: data.data.length,
      },
    };
  }

  return {
    items: Array.isArray(data?.data) ? data.data : [],
    meta: {
      current_page: data?.current_page ?? 1,
      last_page: data?.last_page ?? 1,
      per_page: data?.per_page ?? params.per_page ?? 10,
      total: data?.total ?? 0,
    },
  };
}

export async function deleteActivityLog(encryptedId) {
  return axios.delete(`/api/activity-logs/${encryptedId}`);
}
