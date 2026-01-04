import { useQuery } from '@tanstack/react-query';

import type { Image, MediaFilters, PaginatedResponse } from '@/types/api';

import type { UseQueryOptions } from '@tanstack/react-query';


/**
 * Fetch media images with filters
 */
async function fetchMedia(filters?: MediaFilters): Promise<PaginatedResponse<Image>> {
  const params = new URLSearchParams();

  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.page) {
    params.append('page', filters.page.toString());
  }
  if (filters?.per_page) {
    params.append('per_page', filters.per_page.toString());
  }

  const queryString = params.toString();
  const url = `/sb/admin/media/api${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch media');
  }

  return response.json();
}

/**
 * Hook to get paginated media images
 */
export function useMedia(
  filters?: MediaFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Image>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['media', filters],
    queryFn: async () => fetchMedia(filters),
    ...options,
  });
}
