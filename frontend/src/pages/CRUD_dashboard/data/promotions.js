const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function getAuthToken() {
  const token = localStorage.getItem("token");
  return token || null;
}

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildFilterParams(filterModel) {
  if (!filterModel?.items?.length) return [];

  return filterModel.items
    .filter(item => item.value != null && item.value !== "")
    .map(item => `${item.field}~${item.operator}~${item.value}`);
}

function buildSortParams(sortModel) {
  if (!sortModel?.length) return [];
  return sortModel.map(s => `${s.field}~${s.sort}`);
}

/**
 * GET all promotion
 */
export async function getMany() {
  const res = await fetch(`${VITE_BACKEND_URL}/promotions`, {
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
      console.error("Failed to parse /promotions JSON:", e, text);
    }
  }

  if (!res.ok) {
    const message =
      (data && data.error) ||
      `Failed to fetch promotions (HTTP ${res.status})`;
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
 * GET one promotion
 */
export async function getOne(promotionId) {
  const res = await fetch(`${VITE_BACKEND_URL}/promotions/${promotionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch promotion ${promotionId}`);
  }

  return data;
}

/**
 * POST promotion
 */
export async function createOne(promotionData) {
  const res = await fetch(`${VITE_BACKEND_URL}/promotions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(promotionData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to create promotion");
  }

  return data;
}

/**
 * PATCH promotion
 */
export async function updateOne(promotionId, promotionData) {
  const { id, ...payload } = promotionData || {};
  const res = await fetch(`${VITE_BACKEND_URL}/promotions/${promotionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Failed to update promotion ${promotionId}`);
  }

  return data;
}

/**
 * DELETE promotion
 */
export async function deleteOne(promotionId) {
  const res = await fetch(`${VITE_BACKEND_URL}/promotions/${promotionId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    let data = {};
    try {
      data = await res.json();
    } catch {}
    throw new Error(data.error || `Failed to delete promotion ${promotionId}`);
  }
}

/**
 * Validation
 */
export function validate(promotion) {
  const issues = [];

  if (!promotion.name) {
    issues.push({ message: "Name is required", path: ["name"] });
  }
  if (!promotion.type) {
    issues.push({ message: "Type is required", path: ["type"] });
  }
  if (!promotion.startTime) {
    issues.push({ message: "Start time is required", path: ["startTime"] });
  }
  if (!promotion.endTime) {
    issues.push({ message: "End time is required", path: ["endTime"] });
  }
  if (promotion.minSpending != null && promotion.minSpending < 0) {
    issues.push({ message: "Min spending cannot be negative", path: ["minSpending"] });
  }
  if (promotion.rate != null && promotion.rate < 0) {
    issues.push({ message: "Rate cannot be negative", path: ["rate"] });
  }
  if (promotion.points != null && promotion.points < 0) {
    issues.push({ message: "Points cannot be negative", path: ["points"] });
  }

  return { issues };
}