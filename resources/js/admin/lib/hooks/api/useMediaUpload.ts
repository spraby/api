import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Image } from '@/types/api';

interface UploadMediaResponse {
  data: Image[];
}

async function uploadMedia(files: File[]): Promise<Image[]> {
  const csrfToken =
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(`images[${index}]`, file);
  });

  const response = await fetch('/admin/media/api', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'X-CSRF-TOKEN': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));

    throw new Error(error.message || 'Upload failed');
  }

  const result: UploadMediaResponse = await response.json();

  return result.data;
}

export function useMediaUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}
