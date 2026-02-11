import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  LoaderIcon,
  SearchIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';
import type { Image, PaginatedResponse } from '@/types/api';

export interface LibraryContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  filteredImages: Image[];
  selectedImageIds: number[];
  toggleImageSelection: (id: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  data: PaginatedResponse<Image> | undefined;
  uploadingCount?: number;
}

export function LibraryContent({
  searchQuery,
  setSearchQuery,
  isLoading,
  filteredImages,
  selectedImageIds,
  toggleImageSelection,
  currentPage,
  setCurrentPage,
  data,
  uploadingCount = 0,
}: LibraryContentProps) {
  const { t, trans } = useLang();

  const uploadingSkeletons = uploadingCount > 0 ? (
    Array.from({ length: uploadingCount }).map((_, i) => (
      <Card key={`uploading-${i}`} className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square animate-pulse bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  ) : null;

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t('admin.image_picker.search_placeholder')}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {Boolean(isLoading) && uploadingCount === 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        )}

        {!isLoading && filteredImages.length === 0 && uploadingCount === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="mb-3 size-16 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? t('admin.image_picker.no_results') : t('admin.image_picker.no_images')}
            </p>
          </div>
        )}

        {(!isLoading || uploadingCount > 0) && (filteredImages.length > 0 || uploadingCount > 0) && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {uploadingSkeletons}
            {filteredImages.map((image: Image) => {
              const isSelected = selectedImageIds.includes(image.id);

              return (
                <Card
                  key={image.id}
                  className={cn(
                    'group relative cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary',
                    isSelected && 'ring-2 ring-primary'
                  )}
                  onClick={() => toggleImageSelection(image.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        alt={image.alt || image.name}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                        src={image.url}
                      />
                      {Boolean(isSelected) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckIcon className="size-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {data?.meta != null && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {trans('admin.pagination.showing', {
              from: data.meta.from?.toString() || '0',
              to: data.meta.to?.toString() || '0',
              total: data.meta.total.toString(),
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage === 1}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="text-sm">
              {trans('admin.pagination.page_of', {
                current: currentPage.toString(),
                total: data.meta.last_page.toString(),
              })}
            </span>
            <Button
              disabled={currentPage === data.meta.last_page}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(data.meta.last_page, currentPage + 1))}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
