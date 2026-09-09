/**
 * Fetch-based HTTP Client with Inertia CSRF integration
 *
 * Uses native fetch API with Inertia's CSRF token handling
 * Compatible with TanStack Query and Inertia.js
 */

// ============================================
// TYPES
// ============================================

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface LaravelErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

interface FetchResponse<T> {
  data: T;
  status: number;
}

interface FetchRequestConfig {
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
}

export interface CsrfToken {
  token: string;
  header: string;
}

// ============================================
// STATE
// ============================================

/** Delay before reloading the page after an expired session (ms) */
const SESSION_RELOAD_DELAY = 2000;

/** Ensures a single reload when several requests fail with 419 at once */
let sessionExpiredHandled = false;

// ============================================
// HELPERS
// ============================================

/**
 * Get CSRF token for the current session.
 *
 * Prefers the XSRF-TOKEN cookie: Laravel refreshes it with every response, so it
 * stays in sync while the SPA is running. The meta tag is only rendered on a full
 * page load and goes stale as soon as the session is regenerated (re-login in
 * another tab) or expires, which produces a 419 "CSRF token mismatch".
 */
export function getCsrfToken(): CsrfToken | null {
  const cookiePrefix = 'XSRF-TOKEN=';
  const xsrfCookie = document.cookie
    .split('; ')
    .find((c) => c.startsWith(cookiePrefix));

  if (xsrfCookie) {
    return {
      token: decodeURIComponent(xsrfCookie.slice(cookiePrefix.length)),
      header: 'X-XSRF-TOKEN',
    };
  }

  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  if (metaToken) {
    return { token: metaToken, header: 'X-CSRF-TOKEN' };
  }

  return null;
}

/**
 * Message for an expired session / stale CSRF token.
 *
 * This module is used outside of React, so Inertia's `lang` props are not
 * available here — fall back to the document locale.
 */
function sessionExpiredMessage(): string {
  const locale = document.documentElement.lang.toLowerCase();

  return locale.startsWith('ru')
    ? 'Сессия истекла. Страница будет перезагружена, повторите действие.'
    : 'Your session has expired. The page will reload, please try again.';
}

/**
 * Recover from an expired session: a full page load issues a fresh CSRF token,
 * and if the session is really gone Laravel redirects to the login page itself.
 * Guarded so parallel requests schedule only one reload.
 */
function handleSessionExpired(): void {
  if (sessionExpiredHandled) {
    return;
  }

  sessionExpiredHandled = true;

  // Delay so the toast is readable before the page goes away
  window.setTimeout(() => { window.location.reload(); }, SESSION_RELOAD_DELAY);
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
      case 419:
        apiError.message = sessionExpiredMessage();
        break;
      case 422:
        apiError.message = data?.message ?? 'Validation failed.';
        break;
      case 500:
        apiError.message = 'Server error. Please try again later.';
        break;
    }
  } catch {
    // If response is not JSON, use status text
    apiError.message = response.status === 419
      ? sessionExpiredMessage()
      : (response.statusText ?? 'An error occurred');
  }

  if (response.status === 419) {
    handleSessionExpired();
  }

  const error = new Error(apiError.message);

  Object.assign(error, apiError);

  throw error;
}

/**
 * Make fetch request with Inertia CSRF token
 */
async function makeFetchRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const csrfToken = getCsrfToken();

  // Build headers using Headers API for type safety
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');

  // Add CSRF token if available
  if (csrfToken) {
    headers.set(csrfToken.header, csrfToken.token);
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
