import { useEffect, useState } from 'react';

import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  SearchIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMedia } from '@/lib/hooks/api/useMedia';
import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';
import type { Image } from '@/types/api';

type ImagePickerMode = 'select' | 'upload';

interface ImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (imageIds: number[], images?: Image[]) => void;
  onUpload?: (files: File[]) => void;
  multiple?: boolean;
  excludeImageIds?: number[];
  isUploading?: boolean;
  maxFiles?: number;
  defaultTab?: ImagePickerMode;
  /** Hide upload tab - only show library selection */
  hideUpload?: boolean;
  /** Hide library tab - only show upload */
  hideLibrary?: boolean;
}

export function ImagePicker({
  open,
  onOpenChange,
  onSelect,
  onUpload,
  multiple = true,
  excludeImageIds = [],
  isUploading = false,
  maxFiles = 50,
  defaultTab = 'select',
  hideUpload = false,
  hideLibrary = false,
}: ImagePickerProps) {
  const { t } = useLang();

  // Tab state
  const getEffectiveDefaultTab = (): ImagePickerMode => {
    if (hideLibrary) {return 'upload';}
    if (hideUpload) {return 'select';}

    return defaultTab;
  };
  const effectiveDefaultTab = getEffectiveDefaultTab();
  const [activeTab, setActiveTab] = useState<ImagePickerMode>(effectiveDefaultTab);

  // Library selection state
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedImageIds([]);
      setSearchQuery('');
      setCurrentPage(1);
      setSelectedFiles([]);
      setActiveTab(effectiveDefaultTab);
    }
  }, [open, effectiveDefaultTab]);

  const { data, isLoading } = useMedia(
    {
      search: searchQuery || undefined,
      page: currentPage,
      per_page: 24,
    },
    { enabled: open && !hideLibrary }
  );

  // Library handlers
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
    if (selectedImageIds.length === 0 || !onSelect) {return;}
    const selectedImages = filteredImages.filter(img => selectedImageIds.includes(img.id));

    onSelect(selectedImageIds, selectedImages);
    handleClose();
  };

  // Upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > maxFiles) {return;}
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

    if (files.length > maxFiles) {return;}
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0 || !onUpload) {return;}
    onUpload(selectedFiles);
  };

  // Close handler
  const handleClose = () => {
    setSelectedImageIds([]);
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedFiles([]);
    setActiveTab(effectiveDefaultTab);
    onOpenChange(false);
  };

  const filteredImages = data?.data.filter((image) => !excludeImageIds.includes(image.id)) || [];

  const showTabs = !hideUpload && !hideLibrary;

  const libraryContentProps = {
    currentPage,
    data,
    filteredImages,
    isLoading,
    multiple,
    searchQuery,
    selectedImageIds,
    setCurrentPage,
    setSearchQuery,
    t,
    toggleImageSelection,
  };

  const uploadContentProps = {
    dragActive,
    handleDrag,
    handleDrop,
    handleFileSelect,
    isUploading,
    maxFiles,
    removeFile,
    selectedFiles,
    t,
  };

  const renderContent = () => {
    if (showTabs) {
      return (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ImagePickerMode)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">
              <ImageIcon className="mr-2 size-4" />
              {t('admin.image_picker.tab_library')}
            </TabsTrigger>
            <TabsTrigger value="upload">
              <UploadIcon className="mr-2 size-4" />
              {t('admin.image_picker.tab_upload')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="mt-4">
            <LibraryContent {...libraryContentProps} />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <UploadContent {...uploadContentProps} />
          </TabsContent>
        </Tabs>
      );
    }

    if (hideUpload) {
      return <LibraryContent {...libraryContentProps} />;
    }

    return <UploadContent {...uploadContentProps} />;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t('admin.image_picker.title')}</DialogTitle>
          <DialogDescription>{t('admin.image_picker.description')}</DialogDescription>
        </DialogHeader>

        {renderContent()}

        <DialogFooter>
          <Button disabled={isUploading} type="button" variant="outline" onClick={handleClose}>
            {t('admin.common.cancel')}
          </Button>

          {!!(showTabs ? activeTab === 'select' : !hideLibrary) && (
            <Button disabled={selectedImageIds.length === 0} onClick={handleSelect}>
              {t('admin.image_picker.select_button', {
                count: selectedImageIds.length.toString(),
              })}
            </Button>
          )}

          {!!(showTabs ? activeTab === 'upload' : !hideUpload) && (
            <Button disabled={selectedFiles.length === 0 || isUploading} onClick={handleUpload}>
              {isUploading ? t('admin.common.uploading') : t('admin.common.upload')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Library content component
interface LibraryContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  filteredImages: Image[];
  selectedImageIds: number[];
  toggleImageSelection: (id: number) => void;
  multiple: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  data: { meta: { last_page: number; from?: number; to?: number; total: number } } | undefined;
  t: (key: string, params?: Record<string, string>) => string;
}

function LibraryContent({
  searchQuery,
  setSearchQuery,
  isLoading,
  filteredImages,
  selectedImageIds,
  toggleImageSelection,
  currentPage,
  setCurrentPage,
  data,
  t,
}: LibraryContentProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
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

      {/* Image Grid */}
      <div className="max-h-[400px] overflow-y-auto">
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
              {searchQuery ? t('admin.image_picker.no_results') : t('admin.image_picker.no_images')}
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
                  onClick={() => toggleImageSelection(image.id)}
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
      {!!data?.meta && data.meta.last_page > 1 && (
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
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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

// Upload content component
interface UploadContentProps {
  selectedFiles: File[];
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  isUploading: boolean;
  maxFiles: number;
  t: (key: string, params?: Record<string, string>) => string;
}

function UploadContent({
  selectedFiles,
  dragActive,
  handleDrag,
  handleDrop,
  handleFileSelect,
  removeFile,
  isUploading,
  maxFiles,
  t,
}: UploadContentProps) {
  return (
    <div className="space-y-4">
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
        onClick={() => document.getElementById('image-picker-upload-input')?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            document.getElementById('image-picker-upload-input')?.click();
          }
        }}
      >
        <UploadIcon className="mb-3 size-12 text-muted-foreground" />
        <p className="text-sm font-medium">
          {selectedFiles.length > 0
            ? t('admin.image_picker.files_selected', { count: selectedFiles.length.toString() })
            : t('admin.image_picker.select_or_drop')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('admin.image_picker.max_files', { max: maxFiles.toString() })}
        </p>
      </div>

      <input
        accept="image/*"
        className="hidden"
        id="image-picker-upload-input"
        multiple
        type="file"
        onChange={handleFileSelect}
      />

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
          <p className="mb-2 text-sm font-medium">{t('admin.image_picker.selected_files')}:</p>
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
  );
}