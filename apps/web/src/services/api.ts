import type { Item, ItemCreate, ItemUpdate, HealthResponse } from "@/types";

/**
 * API base URL
 * In development, requests are proxied through Vite
 * In production, use the full API URL
 */
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/v1`
  : "/api/v1";

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Use default message
    }
    throw new ApiError(message, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Item API endpoints
 */
export const itemApi = {
  /**
   * Get all items
   */
  list: () => fetchApi<Item[]>("/items"),

  /**
   * Get item by ID
   */
  get: (id: string) => fetchApi<Item>(`/items/${id}`),

  /**
   * Create a new item
   */
  create: (data: ItemCreate) =>
    fetchApi<Item>("/items", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Update an existing item
   */
  update: (id: string, data: ItemUpdate) =>
    fetchApi<Item>(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Delete an item
   */
  delete: (id: string) =>
    fetchApi<void>(`/items/${id}`, {
      method: "DELETE",
    }),
};

/**
 * Health check endpoint
 */
export const healthApi = {
  check: () =>
    fetchApi<HealthResponse>("/health".replace("/v1", "").replace("/api", "/api")),
};
