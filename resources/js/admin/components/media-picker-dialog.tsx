import { useState } from 'react';

import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ImageIcon, SearchIcon } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMedia } from '@/lib/hooks/api/useMedia';
import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';
import type { Image } from '@/types/api';

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageIds: number[]) => void;
  multiple?: boolean;
  excludeImageIds?: number[];
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  multiple = true,
  excludeImageIds = [],
}: MediaPickerDialogProps) {
  const { t } = useLang();
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
    if (selectedImageIds.length === 0) {
      return;}
    onSelect(selectedImageIds);
    handleClose();
  };

  const handleClose = () => {
    setSelectedImageIds([]);
    setSearchQuery('');
    setCurrentPage(1);
    onOpenChange(false);
  };

  const filteredImages =
    data?.data.filter((image) => !excludeImageIds.includes(image.id)) || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t('admin.media_picker.title')}</DialogTitle>
          <DialogDescription>
            {multiple
              ? t('admin.media_picker.description_multiple')
              : t('admin.media_picker.description_single')}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('admin.media_picker.search_placeholder')}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Image Grid */}
        <div className="max-h-[500px] overflow-y-auto">
          {!!isLoading && (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          )}
          {!isLoading && filteredImages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="mb-3 size-16 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? t('admin.media_picker.no_results')
                  : t('admin.media_picker.no_images')}
              </p>
            </div>
          )}
          {!isLoading && filteredImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filteredImages.map((image: Image) => {
                const isSelected = selectedImageIds.includes(image.id);

                return (
                  <Card
                    key={image.id}
                    className={cn(
                      'group relative cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary',
                      isSelected && 'ring-2 ring-primary'
                    )}
                    onClick={() => {
                      toggleImageSelection(image.id);
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          alt={image.alt || image.name}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                          src={image.url}
                        />
                        {!!isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <CheckIcon className="size-6" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-medium" title={image.name}>
                          {image.name}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!!data && !!data.meta && data.meta.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t('admin.pagination.showing', {
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
                onClick={() => {
                  setCurrentPage((prev) => Math.max(1, prev - 1));
                }}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <span className="text-sm">
                {t('admin.pagination.page_of', {
                  current: currentPage.toString(),
                  total: data.meta.last_page.toString(),
                })}
              </span>
              <Button
                disabled={currentPage === data.meta.last_page}
                size="sm"
                variant="outline"
                onClick={() => {
                  setCurrentPage((prev) => Math.min(data.meta.last_page, prev + 1));
                }}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('admin.common.cancel')}
          </Button>
          <Button disabled={selectedImageIds.length === 0} onClick={handleSelect}>
            {t('admin.media_picker.select_button', {
              count: selectedImageIds.length.toString(),
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
