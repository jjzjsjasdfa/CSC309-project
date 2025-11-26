const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function getAuthToken() {
  const token = localStorage.getItem("token");
  return token || null;
}

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * GET all users
 */
export async function getMany() {
  const res = await fetch(`${VITE_BACKEND_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse /users JSON:", e, text);
    }
  }

  if (!res.ok) {
    const message =
      (data && data.error) ||
      `Failed to fetch users (HTTP ${res.status})`;
    throw new Error(message);
  }

  const results = data && Array.isArray(data.results) ? data.results : [];
  const count =
    data && typeof data.count === "number"
      ? data.count
      : results.length;

  return {
    items: results,
    itemCount: count,
  };
}

/**
 * GET one user
 */
export async function getOne(userId) {
  const res = await fetch(`${VITE_BACKEND_URL}/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch user ${userId}`);
  }

  return data;
}

/**
 * POST user
 */
export async function createOne(userData) {
  const res = await fetch(`${VITE_BACKEND_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to create user");
  }

  return data;
}

/**
 * PATCH user
 */
export async function updateOne(userId, userData) {
  const { id, ...payload } = userData || {};
  const res = await fetch(`${VITE_BACKEND_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Failed to update user ${userId}`);
  }

  return data;
}

/**
 * Validation
 */
export function validate(user) {
  return { issues: [] };
}