/**
 * API Utilities
 *
 * Helper functions for API interactions:
 * - Error handling
 * - Toast notifications
 * - Response transformations
 */

import { toast } from 'sonner';

import type { ApiError } from './fetch-client';

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Handle API errors with toast notifications
 * Shows validation errors individually or a general error message
 */
export function handleApiError(error: unknown, fallbackMessage?: string): void {
  const apiError = error as ApiError;

  if (apiError.errors) {
    // Show each validation error
    Object.entries(apiError.errors).forEach(([_field, messages]) => {
      messages.forEach((message) => {
        toast.error(message);
      });
    });
  } else {
    // Show general error
    toast.error(apiError.message || fallbackMessage ?? 'An error occurred');
  }
}

/**
 * Extract error message from ApiError
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const apiError = error as ApiError;

  if (apiError.errors) {
    // Return first validation error
    const firstError = Object.values(apiError.errors)[0];

    return firstError?.[0] || fallback;
  }

  return apiError.message || fallback;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

/**
 * Show success toast notification
 */
export function showSuccessToast(message: string): void {
  toast.success(message);
}

/**
 * Show error toast notification
 */
export function showErrorToast(message: string): void {
  toast.error(message);
}

/**
 * Show info toast notification
 */
export function showInfoToast(message: string): void {
  toast.info(message);
}

/**
 * Show loading toast notification
 * Returns toast ID that can be used to dismiss it
 */
export function showLoadingToast(message: string): string | number {
  return toast.loading(message);
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId: string | number): void {
  toast.dismiss(toastId);
}

// ============================================
// RESPONSE TRANSFORMATIONS
// ============================================

/**
 * Extract data from Axios response
 * Useful for query functions
 */
export function extractData<T>(response: { data: T }): T {
  return response.data;
}

/**
 * Type guard to check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  );
}
