/**
 * Item model
 */
export interface Item {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Item creation request
 */
export interface ItemCreate {
  title: string;
  description?: string;
}

/**
 * Item update request
 */
export interface ItemUpdate {
  title?: string;
  description?: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  detail: string;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: string;
  version?: string;
}
