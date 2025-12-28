/**
 * Fetch-based HTTP Client with Inertia CSRF integration
 *
 * Uses native fetch API with Inertia's CSRF token handling
 * Compatible with TanStack Query and Inertia.js
 */

import type { ApiError, LaravelErrorResponse } from './client';

// ============================================
// TYPES
// ============================================

interface FetchResponse<T> {
  data: T;
  status: number;
}

interface FetchRequestConfig {
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
}

// ============================================
// HELPERS
// ============================================

/**
 * Get CSRF token from meta tag (set by Laravel)
 */
function getCsrfToken(): string | null {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
}

/**
 * Build URL with query params
 */
function buildUrl(baseUrl: string, params?: Record<string, string | number>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Handle fetch errors and transform to ApiError
 */
async function handleFetchError(response: Response): Promise<never> {
  const apiError: ApiError = {
    message: 'An error occurred',
    status: response.status,
  };

  try {
    const data = (await response.json()) as LaravelErrorResponse;

    if (data?.message) {
      apiError.message = data.message;
    }

    if (data?.errors) {
      apiError.errors = data.errors;
    }

    // Handle specific status codes
    switch (response.status) {
      case 401:
        apiError.message = 'Unauthorized. Please log in.';
        break;
      case 403:
        apiError.message = "Forbidden. You don't have permission.";
        break;
      case 404:
        apiError.message = 'Resource not found.';
        break;
      case 422:
        apiError.message = data?.message || 'Validation failed.';
        break;
      case 500:
        apiError.message = 'Server error. Please try again later.';
        break;
    }
  } catch {
    // If response is not JSON, use status text
    apiError.message = response.statusText || 'An error occurred';
  }

  throw apiError;
}

/**
 * Make fetch request with Inertia CSRF token
 */
async function makeFetchRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const csrfToken = getCsrfToken();

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...options.headers,
  };

  // Add CSRF token if available
  if (csrfToken) {
    headers['X-CSRF-TOKEN'] = csrfToken;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin', // Important for cookies/sessions
  });

  if (!response.ok) {
    await handleFetchError(response);
  }

  return response.json();
}

// ============================================
// FETCH CLIENT (Axios-like API)
// ============================================

export const fetchClient = {
  async get<T>(url: string, config?: FetchRequestConfig): Promise<FetchResponse<T>> {
    const fullUrl = buildUrl(url, config?.params);
    const data = await makeFetchRequest<T>(fullUrl, {
      method: 'GET',
      headers: config?.headers,
    });
    return { data, status: 200 };
  },

  async post<T>(
    url: string,
    body?: unknown,
    config?: FetchRequestConfig
  ): Promise<FetchResponse<T>> {
    const fullUrl = buildUrl(url, config?.params);
    const data = await makeFetchRequest<T>(fullUrl, {
      method: 'POST',
      headers: config?.headers,
      body: JSON.stringify(body),
    });
    return { data, status: 200 };
  },

  async put<T>(
    url: string,
    body?: unknown,
    config?: FetchRequestConfig
  ): Promise<FetchResponse<T>> {
    const fullUrl = buildUrl(url, config?.params);
    const data = await makeFetchRequest<T>(fullUrl, {
      method: 'PUT',
      headers: config?.headers,
      body: JSON.stringify(body),
    });
    return { data, status: 200 };
  },

  async patch<T>(
    url: string,
    body?: unknown,
    config?: FetchRequestConfig
  ): Promise<FetchResponse<T>> {
    const fullUrl = buildUrl(url, config?.params);
    const data = await makeFetchRequest<T>(fullUrl, {
      method: 'PATCH',
      headers: config?.headers,
      body: JSON.stringify(body),
    });
    return { data, status: 200 };
  },

  async delete<T>(url: string, config?: FetchRequestConfig): Promise<FetchResponse<T>> {
    const fullUrl = buildUrl(url, config?.params);
    const data = await makeFetchRequest<T>(fullUrl, {
      method: 'DELETE',
      headers: config?.headers,
    });
    return { data, status: 200 };
  },
};

export default fetchClient;
