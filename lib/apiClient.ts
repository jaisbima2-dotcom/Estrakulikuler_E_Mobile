// lib/apiClient.ts
/**
 * Centralized API Client
 * Provides consistent error handling and request/response formatting
 * for all API calls between frontend and backend
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Makes an API request with error handling
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = 10000,
    headers = {},
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    timeout
  );

  try {
    const response = await fetch(endpoint, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP Error: ${response.status}`,
        status: response.status,
      };
    }

    return {
      success: true,
      data: data.data || data,
      status: response.status,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        success: false,
        error: "Request timeout. Please try again.",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred",
    };
  }
}

/**
 * GET request helper
 */
export function apiGet<T = any>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    ...options,
    method: "GET",
  });
}

/**
 * POST request helper
 */
export function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request helper
 */
export function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T = any>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
}
