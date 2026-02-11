import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMedia } from '@/lib/hooks/api/useMedia';
import { useMediaUpload } from '@/lib/hooks/api/useMediaUpload';
import { useLang } from '@/lib/lang';

import { LibraryContent } from './library-content';
import { DropZone } from './upload-content';

interface ImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (imageIds: number[]) => void;
  multiple?: boolean;
  excludeImageIds?: number[];
}

export function ImagePicker({
  open,
  onOpenChange,
  onSelect,
  multiple = true,
  excludeImageIds = [],
}: ImagePickerProps) {
  const { t, trans } = useLang();

  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadingCount, setUploadingCount] = useState(0);

  const uploadMutation = useMediaUpload();

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedImageIds([]);
      setSearchQuery('');
      setCurrentPage(1);
      setUploadingCount(0);
    }
  }, [open]);

  const { data, isLoading } = useMedia(
    {
      search: searchQuery || undefined,
      page: currentPage,
      per_page: 24,
    },
    { enabled: open }
  );

  const toggleImageSelection = (imageId: number) => {
    if (!multiple) {
      setSelectedImageIds([imageId]);

      return;
    }

    setSelectedImageIds((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
  };

  const handleSelect = () => {
    if (selectedImageIds.length === 0 || !onSelect) { return; }
    onSelect(selectedImageIds);
    onOpenChange(false);
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadingCount((prev) => prev + files.length);

    uploadMutation.mutate(files, {
      onSuccess: (uploaded) => {
        setUploadingCount((prev) => Math.max(0, prev - files.length));
        // Auto-select uploaded images
        const newIds = uploaded.map((img) => img.id);

        setSelectedImageIds((prev) => [...prev, ...newIds]);
      },
      onError: (error) => {
        setUploadingCount((prev) => Math.max(0, prev - files.length));
        toast.error(error.message);
      },
    });
  };

  const filteredImages = data?.data.filter((image) => !excludeImageIds.includes(image.id)) || [];
  const isUploading = uploadingCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t('admin.image_picker.title')}</DialogTitle>
          <DialogDescription>{t('admin.image_picker.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <DropZone disabled={isUploading} onFilesSelected={handleFilesSelected} />

          <LibraryContent
            currentPage={currentPage}
            data={data}
            filteredImages={filteredImages}
            isLoading={isLoading}
            searchQuery={searchQuery}
            selectedImageIds={selectedImageIds}
            setCurrentPage={setCurrentPage}
            setSearchQuery={setSearchQuery}
            toggleImageSelection={toggleImageSelection}
            uploadingCount={uploadingCount}
          />
        </div>

        <DialogFooter>
          <Button disabled={isUploading} type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('admin.common.cancel')}
          </Button>

          <Button disabled={selectedImageIds.length === 0 || isUploading} onClick={handleSelect}>
            {trans('admin.image_picker.select_button', {
              count: selectedImageIds.length.toString(),
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
