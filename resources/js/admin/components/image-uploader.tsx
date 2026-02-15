import { useCallback, useMemo, useRef, useState } from 'react';

import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';

export interface UploadedImage {
  id: number | string;
  name: string;
  src: string;
  url: string;
}

export interface PreviewImage {
  uid: string;
  url: string;
  name: string;
}

export interface ImageUploaderProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
  onStartLoading?: (images: PreviewImage[]) => void;
  onFinishLoading?: (images: UploadedImage[]) => void;
}

function getCsrfToken(): string | null {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageUploader({
  multiple = true,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSize = 10 * 1024 * 1024,
  maxFiles = 50,
  className,
  onStartLoading,
  onFinishLoading,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { t, trans } = useLang();

  const acceptedTypes = useMemo(() => accept.split(',').map((s) => s.trim()), [accept]);

  const upload = useCallback(
    async (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const limit = multiple ? maxFiles : 1;

      const valid = arr.slice(0, limit).filter((file) => {
        const typeOk = acceptedTypes.some(
          (type) => file.type === type || file.type.startsWith(type.replace('*', '')),
        );

        return typeOk && file.size <= maxSize;
      });

      if (valid.length < arr.length) {
        toast.warning(t('image_uploader.invalid_files_skipped'));
      }

      if (valid.length === 0) {
        return;
      }

      // Build previews and notify immediately
      const previews: PreviewImage[] = valid.map((file) => ({
        uid: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        name: file.name,
      }));

      onStartLoading?.(previews);
      setUploading(true);

      const formData = new FormData();

      valid.forEach((f) => formData.append('images[]', f));

      try {
        const csrfToken = getCsrfToken();
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        };

        if (csrfToken) {
          headers['X-CSRF-TOKEN'] = csrfToken;
        }

        const response = await fetch(route('admin.media.api.store'), {
          method: 'POST',
          headers,
          credentials: 'same-origin',
          body: formData,
        });

        if (response.ok) {
          const result = (await response.json()) as { data: UploadedImage[] };

          onFinishLoading?.(result.data);
        } else {
          toast.error(t('image_uploader.upload_failed'));
        }
      } catch {
        toast.error(t('image_uploader.upload_failed'));
      } finally {
        setUploading(false);
        previews.forEach((p) => URL.revokeObjectURL(p.url));
      }
    },
    [multiple, maxFiles, maxSize, acceptedTypes, onStartLoading, onFinishLoading, t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (e.dataTransfer.files.length > 0) {
        void upload(e.dataTransfer.files);
      }
    },
    [upload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        void upload(e.target.files);
      }

      e.target.value = '';
    },
    [upload],
  );

  return (
    <button
      type="button"
      disabled={uploading}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors',
        'text-muted-foreground hover:border-primary/50 hover:bg-muted/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      {uploading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : (
        <Upload className="h-8 w-8" />
      )}
      <span className="text-sm font-medium">
        {uploading
          ? t('common.uploading')
          : t(multiple ? 'image_uploader.drop_or_click_multiple' : 'image_uploader.drop_or_click_single')}
      </span>
      {!uploading ? (
        <span className="text-xs text-muted-foreground/70">
          {trans(
            multiple ? 'image_uploader.hint_multiple' : 'image_uploader.hint_single',
            {
              formats: accept.replace(/image\//g, '.').replace(/,/g, ', '),
              size: formatBytes(maxSize),
              max: maxFiles,
            },
          )}
        </span>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />
    </button>
  );
}
