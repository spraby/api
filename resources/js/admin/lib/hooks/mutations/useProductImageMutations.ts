import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { productKeys } from '@/lib/api/query-keys';
import type {
  AttachImagesRequest,
  ProductImage,
  ReorderImagesRequest,
  SetVariantImageRequest,
  Variant,
} from '@/types/api';

interface AttachImagesResponse {
  message: string;
  images: ProductImage[];
}

interface UploadImagesResponse {
  message: string;
  images: ProductImage[];
}

interface DetachImageResponse {
  message: string;
  images: ProductImage[];
}

interface ReorderImagesResponse {
  message: string;
  images: ProductImage[];
}

interface SetVariantImageResponse {
  message: string;
  variant: Variant;
}

/**
 * Attach existing images from media library to product
 */
export function useAttachProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: number;
      data: AttachImagesRequest;
    }): Promise<AttachImagesResponse> => {
      const response = await fetch(`/sb/admin/products/${productId}/images/attach/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to attach images');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(data.message);
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Upload new images and attach to product
 */
export function useUploadProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      files,
    }: {
      productId: number;
      files: File[];
    }): Promise<UploadImagesResponse> => {
      const formData = new FormData();

      files.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      const response = await fetch(`/sb/admin/products/${productId}/images/upload/api`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to upload images');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(data.message);
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Detach image from product
 */
export function useDetachProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      productImageId,
    }: {
      productId: number;
      productImageId: number;
    }): Promise<DetachImageResponse> => {
      const response = await fetch(`/sb/admin/products/${productId}/images/${productImageId}/api`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
        },
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to detach image');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(data.message);
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Reorder product images
 */
export function useReorderProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: number;
      data: ReorderImagesRequest;
    }): Promise<ReorderImagesResponse> => {
      const response = await fetch(`/sb/admin/products/${productId}/images/reorder/api`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to reorder images');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(data.message);
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Set image for variant
 */
export function useSetVariantImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variantId,
      productId: _productId, // Only used in onSuccess for cache invalidation
      data,
    }: {
      variantId: number;
      productId: number;
      data: SetVariantImageRequest;
    }): Promise<SetVariantImageResponse> => {
      const response = await fetch(`/sb/admin/variants/${variantId}/image/api`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to set variant image');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(data.message);
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
