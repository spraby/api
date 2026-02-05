import { useState } from 'react';

import { CheckIcon, ImageIcon } from 'lucide-react';

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
import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/models';

interface ProductImagesPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (productImageId: number) => void;
  productImages: ProductImage[];
  currentImageId?: number | null;
}

/**
 * A picker dialog that allows selecting an image from the product's images
 * Used for assigning images to product variants
 */
export function ProductImagesPicker({
  open,
  onOpenChange,
  onSelect,
  productImages,
  currentImageId,
}: ProductImagesPickerProps) {
  const { t } = useLang();
  const [selectedImageId, setSelectedImageId] = useState<number | null>(currentImageId || null);

  const sortedImages = [...productImages].sort((a, b) => a.position - b.position);

  const handleSelect = () => {
    if (selectedImageId === null) {
      return;
    }
    onSelect(selectedImageId);
    handleClose();
  };

  const handleClose = () => {
    setSelectedImageId(currentImageId || null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-4xl sm:w-full">
        <DialogHeader>
          <DialogTitle>{t('admin.product_images_picker.title')}</DialogTitle>
          <DialogDescription>{t('admin.product_images_picker.description')}</DialogDescription>
        </DialogHeader>

        {/* Image Grid */}
        <div className="max-h-[60vh] overflow-y-auto sm:max-h-[500px]">
          {sortedImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="mb-3 size-16 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t('admin.product_images_picker.no_images')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('admin.product_images_picker.add_images_first')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
              {sortedImages.map((productImage) => {
                const isSelected = selectedImageId === productImage.id;

                return (
                  <Card
                    key={productImage.id}
                    className={cn(
                      'group relative cursor-pointer overflow-hidden rounded-xl transition-all hover:ring-2 hover:ring-primary',
                      isSelected && 'ring-2 ring-primary'
                    )}
                    onClick={() => {
                        if(productImage?.id) {setSelectedImageId(productImage.id);}
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
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
          <Button disabled={selectedImageId === null} onClick={handleSelect}>
            {t('admin.product_images_picker.select_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
