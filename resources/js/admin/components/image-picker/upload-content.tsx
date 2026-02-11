import { useRef, useState } from 'react';

import { UploadIcon } from 'lucide-react';

import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesSelected, disabled = false }: DropZoneProps) {
  const { t } = useLang();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      onFilesSelected(imageFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!disabled) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files || []));
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <>
      <div
        className={cn(
          'flex h-20 cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50',
          disabled && 'pointer-events-none opacity-50'
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <UploadIcon className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t('admin.image_picker.select_or_drop')}
        </p>
      </div>

      <input
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        multiple
        type="file"
        onChange={handleFileSelect}
      />
    </>
  );
}
