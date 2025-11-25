const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function getAuthToken() {
  try {
    const saved = localStorage.getItem("auth");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed.token || null;
  } catch {
    return null;
  }
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
export async function getMany({
  paginationModel,
  filterModel,
  sortModel,
}) {
  const page = paginationModel?.page != null ? paginationModel.page + 1 : 1;
  const limit = paginationModel?.pageSize || 10;

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const sortParams = buildSortParams(sortModel);
  sortParams.forEach(s => params.append("sort", s));

  const filterParams = buildFilterParams(filterModel);
  filterParams.forEach(f => params.append("filter", f));

  const res = await fetch(`${VITE_BACKEND_URL}/promotions?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch promotions (HTTP ${res.status})`);
  }

  return {
    items: data.results || [],
    itemCount: data.count ?? (data.results ? data.results.length : 0),
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
  const res = await fetch(`${VITE_BACKEND_URL}/promotions/${promotionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(promotionData),
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