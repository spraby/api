import { useCallback, useState } from 'react';

import { CheckIcon, ImageIcon, Loader2Icon } from 'lucide-react';

import { DropZone } from '@/components/image-picker/upload-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMediaUpload } from '@/lib/hooks/api/useMediaUpload';
import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';
import type { Image as MediaImage, ProductImage } from '@/types/models';

interface UploadedImage {
  imageId: number;
  url: string;
  name: string;
}

interface ProductImagesPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (productImageId: number) => void;
  productImages: ProductImage[];
  currentImageId?: number | null;
  productId?: number;
}

async function attachImagesToProduct(
  productId: number,
  imageIds: number[]
): Promise<ProductImage[]> {
  const csrfToken =
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

  const response = await fetch(`/admin/products/${productId}/images/attach/api`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
    body: JSON.stringify({ image_ids: imageIds }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Attach failed' }));

    throw new Error(error.message || 'Attach failed');
  }

  const result: { data: ProductImage[] } = await response.json();

  return result.data;
}

/**
 * A picker dialog that allows selecting an image from the product's images
 * or uploading a new one. Used for assigning images to product variants.
 */
export function ProductImagesPicker({
  open,
  onOpenChange,
  onSelect,
  productImages,
  currentImageId,
  productId,
}: ProductImagesPickerProps) {
  const { t } = useLang();
  const [selectedImageId, setSelectedImageId] = useState<number | null>(currentImageId || null);
  // Track whether the selected item is an uploaded (not yet attached) image
  const [selectedUploadedImageId, setSelectedUploadedImageId] = useState<number | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isAttaching, setIsAttaching] = useState(false);

  const uploadMutation = useMediaUpload();

  const sortedImages = [...productImages].sort((a, b) => a.position - b.position);

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      uploadMutation.mutate(files, {
        onSuccess: (images: MediaImage[]) => {
          const newUploaded: UploadedImage[] = [];

          for (const img of images) {
            if (img.id != null) {
              newUploaded.push({ imageId: img.id, url: img.url, name: img.name });
            }
          }

          setUploadedImages((prev) => [...prev, ...newUploaded]);

          // Auto-select the first uploaded image
          if (newUploaded.length > 0) {
            setSelectedImageId(null);
            setSelectedUploadedImageId(newUploaded[0].imageId);
          }
        },
      });
    },
    [uploadMutation]
  );

  const handleSelect = async () => {
    // Selecting an existing product image
    if (selectedImageId !== null && selectedUploadedImageId === null) {
      onSelect(selectedImageId);
      handleClose();

      return;
    }

    // Selecting an uploaded image — need to attach to product first
    if (selectedUploadedImageId !== null && productId) {
      setIsAttaching(true);
      try {
        const productImagesResult = await attachImagesToProduct(productId, [
          selectedUploadedImageId,
        ]);

        if (productImagesResult.length > 0 && productImagesResult[0].id != null) {
          onSelect(productImagesResult[0].id);
        }
        handleClose();
      } catch {
        // Error handled silently, user can retry
      } finally {
        setIsAttaching(false);
      }
    }
  };

  const handleClose = () => {
    setSelectedImageId(currentImageId || null);
    setSelectedUploadedImageId(null);
    setUploadedImages([]);
    onOpenChange(false);
  };

  const selectProductImage = (id: number) => {
    setSelectedImageId(id);
    setSelectedUploadedImageId(null);
  };

  const selectUploadedImage = (imageId: number) => {
    setSelectedImageId(null);
    setSelectedUploadedImageId(imageId);
  };

  const hasSelection = selectedImageId !== null || selectedUploadedImageId !== null;
  const isUploading = uploadMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('admin.product_images_picker.title')}</DialogTitle>
          <DialogDescription>{t('admin.product_images_picker.description')}</DialogDescription>
        </DialogHeader>

        {/* DropZone for upload */}
        {!!productId && (
          <DropZone disabled={isUploading || isAttaching} onFilesSelected={handleFilesSelected} />
        )}

        {/* Image Grid */}
        <div className="max-h-[500px] overflow-y-auto">
          {sortedImages.length === 0 && uploadedImages.length === 0 && !isUploading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="mb-3 size-16 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t('admin.product_images_picker.no_images')}
              </p>
              {!!productId && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('admin.product_images_picker.add_images_first')}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {/* Upload skeletons */}
              {isUploading
                ? Array.from({ length: uploadMutation.variables?.length ?? 1 }).map((_, i) => (
                  <Card key={`skeleton-${i}`} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <div className="flex size-full items-center justify-center">
                          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="h-3 w-20 animate-pulse rounded bg-muted-foreground/20" />
                      </div>
                    </CardContent>
                  </Card>
                ))
                : null}

              {/* Uploaded images (not yet attached to product) */}
              {uploadedImages.map((uploaded) => {
                const isSelected = selectedUploadedImageId === uploaded.imageId;

                return (
                  <Card
                    key={`uploaded-${uploaded.imageId}`}
                    className={cn(
                      'group relative cursor-pointer overflow-hidden border-dashed transition-all hover:ring-2 hover:ring-primary',
                      isSelected && 'ring-2 ring-primary'
                    )}
                    onClick={() => selectUploadedImage(uploaded.imageId)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          alt={uploaded.name}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                          src={uploaded.url}
                        />
                        {isSelected ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <CheckIcon className="size-6" />
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs text-muted-foreground">
                          {t('admin.product_images_picker.new_upload')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Existing product images */}
              {sortedImages.map((productImage) => {
                const isSelected =
                  selectedImageId === productImage.id && selectedUploadedImageId === null;

                return (
                  <Card
                    key={productImage.id}
                    className={cn(
                      'group relative cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary',
                      isSelected && 'ring-2 ring-primary'
                    )}
                    onClick={() => {
                      if (productImage?.id) {
                        selectProductImage(productImage.id);
                      }
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {productImage.image?.url ? (
                          <img
                            alt={`Product position ${productImage.position}`}
                            className="size-full object-cover transition-transform group-hover:scale-105"
                            src={productImage.image.url}
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <ImageIcon className="size-12 text-muted-foreground" />
                          </div>
                        )}
                        {!!isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <CheckIcon className="size-6" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs text-muted-foreground">
                          {t('admin.product_images_picker.position')}: {productImage.position}
                          {productImage.position === 1 && (
                            <span className="ml-1 font-medium text-primary">
                              ({t('admin.product_images_picker.main')})
                            </span>
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('admin.common.cancel')}
          </Button>
          <Button disabled={!hasSelection || isAttaching} onClick={handleSelect}>
            {isAttaching ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
            {t('admin.product_images_picker.select_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
