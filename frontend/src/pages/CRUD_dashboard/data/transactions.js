const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function getAuthToken() {
    const token = localStorage.getItem("token");
    return token || null;
}

function getAuthHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// get all transactions
export async function getMany() {
    const res = await fetch(`${VITE_BACKEND_URL}/transactions`, {
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
            console.error(e);
        }
    }

    if (!res.ok) {
        throw new Error((data && data.error) || `Failed to fetch transactions`);
    }

    const results = data && Array.isArray(data.results) ? data.results : [];
    const count = data && typeof data.count === "number" ? data.count : results.length;
    return { items: results, itemCount: count };
}

// get one transaction
export async function getOne(transactionId) {
    const res = await fetch(`${VITE_BACKEND_URL}/transactions/${transactionId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Failed to fetch transaction ${transactionId}`);
    return data;
}

// POST transaction
export async function createOne(transactionData) {
  let url = `${VITE_BACKEND_URL}/transactions`;
  let payload = { ...transactionData };

  // POST redemption transaction
  if (transactionData.type === 'redemption') {
    url = `${VITE_BACKEND_URL}/users/me/transactions`;
  } else if (transactionData.type === 'transfer') {
    if (!transactionData.recipientId) throw new Error("Recipient ID required for transfer");
    url = `${VITE_BACKEND_URL}/users/${transactionData.recipientId}/transactions`;
    delete payload.recipientId;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create transaction");
  return data;
}

/**
 * PATCH Toggle Suspicious (Manager only)
 */
export async function setSuspicious(id, isSuspicious) {
  const res = await fetch(`${VITE_BACKEND_URL}/transactions/${id}/suspicious`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ suspicious: isSuspicious }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update suspicious status");
  return data;
}

/**
 * PATCH Process Redemption (Cashier only)
 */
export async function processRedemption(id) {
  const res = await fetch(`${VITE_BACKEND_URL}/transactions/${id}/processed`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ processed: true }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to process redemption");
  return data;
}

/**
 * Validation Logic
 */
export function validate(tx) {
  const issues = [];

  if (!tx.type) {
    issues.push({ message: "Transaction type is required", path: ["type"] });
    return { issues };
  }

  // Common check
  if (tx.amount != null && tx.amount < 0) {
    issues.push({ message: "Amount must be positive", path: ["amount"] });
  }

  switch (tx.type) {
    case 'purchase':
      if (!tx.utorid) issues.push({ message: "Customer UTORID is required", path: ["utorid"] });
      if (!tx.spent) issues.push({ message: "Spent amount is required", path: ["spent"] });
      if (tx.spent && tx.spent < 0) issues.push({ message: "Spent cannot be negative", path: ["spent"] });
      break;

    case 'adjustment':
      if (!tx.utorid) issues.push({ message: "Target UTORID is required", path: ["utorid"] });
      if (!tx.amount) issues.push({ message: "Amount is required", path: ["amount"] });
      if (!tx.relatedId) issues.push({ message: "Related Transaction ID is required", path: ["relatedId"] });
      break;

    case 'transfer':
      if (!tx.recipientId) issues.push({ message: "Recipient UTORID/ID is required", path: ["recipientId"] });
      if (!tx.amount) issues.push({ message: "Amount is required", path: ["amount"] });
      break;

    case 'redemption':
      if (!tx.amount) issues.push({ message: "Amount is required", path: ["amount"] });
      break;
  }

  return { issues };
}

