import { ImageIcon } from 'lucide-react';

import { ProductImagesManager } from '@/components/product-images-manager';
import { ProductFormSection } from '@/components/product-form-section';
import type { ProductImage } from '@/types/models';

interface ProductImagesSectionProps {
  title: string;
  description?: string;
  isEditMode: boolean;
  processing: boolean;
  images: ProductImage[];
  productId?: number;
  emptyHint: string;
  sectionVariant?: 'card' | 'plain';
  hideHeader?: boolean;
  className?: string;
  contentClassName?: string;
}

export function ProductImagesSection({
  title,
  description,
  isEditMode,
  processing,
  images,
  productId,
  emptyHint,
  sectionVariant = 'card',
  hideHeader = false,
  className,
  contentClassName,
}: ProductImagesSectionProps) {
  if (!isEditMode || !productId) {
    return (
      <ProductFormSection
        title={title}
        description={description}
        variant={sectionVariant}
        hideHeader={hideHeader}
        className={className}
        contentClassName={contentClassName}
      >
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center sm:p-8">
          <ImageIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{emptyHint}</p>
        </div>
      </ProductFormSection>
    );
  }

  return (
    <ProductFormSection
      title={title}
      description={description}
      variant={sectionVariant}
      hideHeader={hideHeader}
      className={className}
      contentClassName={contentClassName ?? 'space-y-3'}
    >
      <ProductImagesManager disabled={processing} images={images} productId={productId} />
    </ProductFormSection>
  );
}
