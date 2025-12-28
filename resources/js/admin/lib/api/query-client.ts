/**
 * TanStack Query Client Configuration
 *
 * Global configuration for React Query:
 * - Caching strategies
 * - Retry logic
 * - Global error handling
 * - DevTools setup
 */

import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { ApiError } from './client';

// ============================================
// QUERY CLIENT CONFIGURATION
// ============================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Время, в течение которого данные считаются свежими (не требуют refetch)
      staleTime: 1000 * 60 * 5, // 5 минут

      // Время, в течение которого неиспользуемые данные хранятся в кэше
      gcTime: 1000 * 60 * 10, // 10 минут (было cacheTime в v4)

      // Retry configuration
      retry: (failureCount, error) => {
        // Не повторяем запросы с ошибками валидации (422) или авторизации (401, 403)
        const apiError = error as ApiError;
        if (apiError.status && [401, 403, 422].includes(apiError.status)) {
          return false;
        }
        // Максимум 2 повтора для других ошибок
        return failureCount < 2;
      },

      // Задержка между повторами (экспоненциальная)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: false, // Не refetch при фокусе окна (можно включить для важных данных)
      refetchOnReconnect: true,    // Refetch при восстановлении соединения
      refetchOnMount: true,        // Refetch при монтировании компонента (если данные stale)
    },
    mutations: {
      // Retry configuration для мутаций
      retry: false, // Не повторяем мутации автоматически (можно включить для idempotent операций)

      // Global error handler для мутаций
      onError: (error) => {
        const apiError = error as ApiError;

        // Показываем validation errors
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([_field, messages]) => {
            messages.forEach((message) => {
              toast.error(message);
            });
          });
        } else {
          // Показываем общую ошибку
          toast.error(apiError.message || 'An error occurred');
        }
      },
    },
  },
});

export default queryClient;
