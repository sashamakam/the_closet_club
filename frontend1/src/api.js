const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  listItems: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v)
    ).toString();
    return fetch(`${BASE_URL}/api/items${qs ? `?${qs}` : ""}`).then(handle);
  },

  getItem: (id) => fetch(`${BASE_URL}/api/items/${id}`).then(handle),

  createItem: (formData) =>
    fetch(`${BASE_URL}/api/items`, { method: "POST", body: formData }).then(handle),

  updateStatus: (id, status, actor_name) =>
    fetch(`${BASE_URL}/api/items/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, actor_name }),
    }).then(handle),

  deleteItem: (id) => fetch(`${BASE_URL}/api/items/${id}`, { method: "DELETE" }).then(handle),

  getMessages: (id) => fetch(`${BASE_URL}/api/items/${id}/messages`).then(handle),

  postMessage: (id, sender_name, text) =>
    fetch(`${BASE_URL}/api/items/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender_name, text }),
    }).then(handle),

  getTimeSlots: (id) => fetch(`${BASE_URL}/api/items/${id}/timeslots`).then(handle),

  proposeTimeSlot: (id, proposed_by, slot_label) =>
    fetch(`${BASE_URL}/api/items/${id}/timeslots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposed_by, slot_label }),
    }).then(handle),

  acceptTimeSlot: (itemId, slotId, accepted_by) =>
    fetch(`${BASE_URL}/api/items/${itemId}/timeslots/${slotId}/accept`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accepted_by }),
    }).then(handle),
};
