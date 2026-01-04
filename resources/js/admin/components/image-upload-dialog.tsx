import { useState } from 'react';

import { UploadIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
  maxFiles?: number;
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  onUpload,
  isUploading = false,
  maxFiles = 50,
}: ImageUploadDialogProps) {
  const { t } = useLang();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > maxFiles) {
      return;
    }
    setSelectedFiles(files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > maxFiles) {
      return;
    }
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      return;}
    onUpload(selectedFiles);
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('admin.image_upload.title')}</DialogTitle>
          <DialogDescription>{t('admin.image_upload.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drag & Drop Zone */}
          <div
            className={cn(
              'flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50',
              selectedFiles.length > 0 && 'border-primary bg-muted/30'
            )}
            role="button"
            tabIndex={0}
            onClick={() => {
              document.getElementById('image-upload-input')?.click();
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                document.getElementById('image-upload-input')?.click();
              }
            }}
          >
            <UploadIcon className="mb-3 size-12 text-muted-foreground" />
            <p className="text-sm font-medium">
              {selectedFiles.length > 0
                ? t('admin.image_upload.files_selected', { count: selectedFiles.length.toString() })
                : t('admin.image_upload.select_or_drop')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('admin.image_upload.max_files', { max: maxFiles.toString() })}
            </p>
          </div>

          <input
            accept="image/*"
            className="hidden"
            id="image-upload-input"
            multiple
            type="file"
            onChange={handleFileSelect}
          />

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">{t('admin.image_upload.selected_files')}:</p>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md bg-muted p-2"
                >
                  <div className="flex items-center gap-3">
                    {file.type.startsWith('image/') && (
                      <img
                        alt={file.name}
                        className="size-10 rounded object-cover"
                        src={URL.createObjectURL(file)}
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    disabled={isUploading}
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button disabled={isUploading} type="button" variant="outline" onClick={handleClose}>
            {t('admin.common.cancel')}
          </Button>
          <Button disabled={selectedFiles.length === 0 || isUploading} onClick={handleUpload}>
            {isUploading ? t('admin.common.uploading') : t('admin.common.upload')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
