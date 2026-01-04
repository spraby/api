import { useState } from 'react';

import { GripVerticalIcon, ImageIcon, PlusIcon, Trash2Icon, UploadIcon } from 'lucide-react';

import { ConfirmationPopover } from '@/components/confirmation-popover';
import { ImageUploadDialog } from '@/components/image-upload-dialog';
import { MediaPickerDialog } from '@/components/media-picker-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  useAttachProductImages,
  useDetachProductImage,
  useReorderProductImages,
  useUploadProductImages,
} from '@/lib/hooks/mutations/useProductImageMutations';
import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/api';

interface ProductImagesManagerProps {
  productId: number;
  images: ProductImage[];
  disabled?: boolean;
}

export function ProductImagesManager({
  productId,
  images,
  disabled = false,
}: ProductImagesManagerProps) {
  const { t } = useLang();
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const attachImages = useAttachProductImages();
  const uploadImages = useUploadProductImages();
  const detachImage = useDetachProductImage();
  const reorderImages = useReorderProductImages();

  const sortedImages = [...images].sort((a, b) => a.position - b.position);

  const handleMediaSelect = (imageIds: number[]) => {
    attachImages.mutate({ productId, data: { image_ids: imageIds } });
  };

  const handleUpload = (files: File[]) => {
    uploadImages.mutate(
      { productId, files },
      {
        onSuccess: () => {
          setUploadDialogOpen(false);
        },
      }
    );
  };

  const handleDelete = (productImageId: number) => {
    detachImage.mutate({ productId, productImageId });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex === null || draggedOverIndex === null || draggedIndex === draggedOverIndex) {
      setDraggedIndex(null);
      setDraggedOverIndex(null);

      return;
    }

    const newImages = [...sortedImages];
    const [removed] = newImages.splice(draggedIndex, 1);

    if (!removed) {
      return;}
    newImages.splice(draggedOverIndex, 0, removed);

    const imageIds = newImages.map((img) => img.id);

    reorderImages.mutate({ productId, data: { image_ids: imageIds } });

    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const isAnyMutationPending =
    attachImages.isPending ||
    uploadImages.isPending ||
    detachImage.isPending ||
    reorderImages.isPending;

  const excludedImageIds = images.map((img) => img.image_id);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={disabled || isAnyMutationPending}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => {
            setMediaPickerOpen(true);
          }}
        >
          <PlusIcon className="mr-2 size-4" />
          {t('admin.products_edit.images.add_from_media')}
        </Button>
        <Button
          disabled={disabled || isAnyMutationPending}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => {
            setUploadDialogOpen(true);
          }}
        >
          <UploadIcon className="mr-2 size-4" />
          {t('admin.products_edit.images.upload_new')}
        </Button>
      </div>

      {/* Images Grid */}
      {sortedImages.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedImages.map((productImage, index) => (
            <Card
              key={productImage.id}
              className={cn(
                'group relative overflow-hidden transition-all',
                draggedIndex === index && 'opacity-50',
                draggedOverIndex === index && 'ring-2 ring-primary'
              )}
              draggable={!disabled && !isAnyMutationPending}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => {
                handleDragOver(e, index);
              }}
              onDragStart={() => {
                handleDragStart(index);
              }}
            >
              <CardContent className="p-3">
                {/* Drag Handle */}
                {!disabled && !isAnyMutationPending && (
                  <div className="absolute left-2 top-2 cursor-move rounded-md bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <GripVerticalIcon className="size-4 text-muted-foreground" />
                  </div>
                )}

                {/* Image */}
                {productImage.url ? (
                  <img
                    alt={`Product ${index + 1}`}
                    className="aspect-square w-full rounded-md border object-cover"
                    src={productImage.url}
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-md border bg-muted">
                    <ImageIcon className="size-12 text-muted-foreground" />
                  </div>
                )}

                {/* Info */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t('admin.products_edit.images.position')}: {productImage.position}
                  </span>
                  {index === 0 && (
                    <Badge className="text-xs" variant="secondary">
                      {t('admin.products_edit.images.main')}
                    </Badge>
                  )}
                </div>

                {/* Delete Button */}
                {!disabled && !isAnyMutationPending && (
                  <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <ConfirmationPopover
                      isLoading={detachImage.isPending}
                      message={t('admin.products_edit.images.confirm_delete')}
                      trigger={
                        <Button size="icon" type="button" variant="destructive">
                          <Trash2Icon className="size-4" />
                        </Button>
                      }
                      onConfirm={() => {
                        handleDelete(productImage.id);
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
          <ImageIcon className="mb-3 size-16 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t('admin.products_edit.images.no_images')}
          </p>
        </div>
      )}

      {/* Dialogs */}
      <MediaPickerDialog
        excludeImageIds={excludedImageIds}
        multiple
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleMediaSelect}
      />

      <ImageUploadDialog
        isUploading={uploadImages.isPending}
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
      />
    </div>
  );
}
