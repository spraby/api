import { useState } from 'react';

import { router } from '@inertiajs/react';
import { ImageIcon, PlusIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import AdminLayout from '@/layouts/AdminLayout';
import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types/inertia';
import type { Image as ImageModel, PaginatedData } from '@/types/models';

// Declare global route function from Ziggy
declare function route(name: string, params?: Record<string, unknown>): string;

interface MediaProps extends PageProps {
  images: PaginatedData<ImageModel>;
}

export default function Media({ images }: MediaProps) {
  const { trans } = useLang();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ImageModel | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 50) {
      toast.error(trans('admin.media.max_files_error'));

      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error(trans('admin.media.no_files_selected'));

      return;
    }

    if (selectedFiles.length > 50) {
      toast.error(trans('admin.media.max_files_error'));

      return;
    }

    setIsUploading(true);

    const formData = new FormData();

    selectedFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    router.post(route('sb.admin.media.store'), formData, {
      onSuccess: () => {
        setUploadDialogOpen(false);
        setSelectedFiles([]);
        setIsUploading(false);
      },
      onError: (errors) => {
        setIsUploading(false);
        const errorMessage = Object.values(errors).flat().join(', ');

        toast.error(errorMessage);
      },
    });
  };

  const confirmDelete = (image: ImageModel) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!imageToDelete) {return;}

    router.delete(route('sb.admin.media.destroy', { image: imageToDelete.id }), {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setImageToDelete(null);
      },
      onError: (errors) => {
        const errorMessage = Object.values(errors).flat().join(', ');

        toast.error(errorMessage);
      },
    });
  };

  return (
    <AdminLayout title={trans('admin.media.title')}>
      <div className="flex flex-1 flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{trans('admin.media.title')}</h1>
          <Button onClick={() => { setUploadDialogOpen(true); }}>
            <PlusIcon className="mr-2 h-4 w-4" />
            {trans('admin.media.upload_button')}
          </Button>
        </div>

        {/* Empty State */}
        {images.data.length === 0 && (
          <Card className="flex flex-col items-center justify-center p-12">
            <ImageIcon className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">{trans('admin.media.empty_title')}</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {trans('admin.media.empty_description')}
            </p>
            <Button className="mt-4" onClick={() => { setUploadDialogOpen(true); }}>
              <UploadIcon className="mr-2 h-4 w-4" />
              {trans('admin.media.upload_first_images')}
            </Button>
          </Card>
        )}

        {/* Image Grid */}
        {images.data.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {images.data.map((image) => (
              <Card
                key={image.id}
                className="group relative overflow-hidden transition-all hover:shadow-md"
              >
                <CardContent className="p-0">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      alt={image.alt || image.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      src={image.url || image.src}
                    />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium" title={image.name}>
                      {image.name}
                    </p>
                    {image.brands.length > 0 && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {image.brands[0]?.name}
                      </p>
                    )}
                  </div>
                  <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => { confirmDelete(image); }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {images.last_page > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              disabled={images.current_page === 1}
              variant="outline"
              onClick={() => {
                router.get(route('sb.admin.media'), { page: images.current_page - 1 });
              }}
            >
              {trans('admin.pagination.previous')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {trans('admin.pagination.page_of', {
                current: images.current_page.toString(),
                total: images.last_page.toString(),
              })}
            </span>
            <Button
              disabled={images.current_page === images.last_page}
              variant="outline"
              onClick={() => {
                router.get(route('sb.admin.media'), { page: images.current_page + 1 });
              }}
            >
              {trans('admin.pagination.next')}
            </Button>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{trans('admin.media.upload_dialog_title')}</DialogTitle>
            <DialogDescription>{trans('admin.media.upload_dialog_description')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                className={cn(
                  'flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                  'hover:border-primary hover:bg-muted/50',
                  selectedFiles.length > 0 && 'border-primary bg-muted/30'
                )}
                htmlFor="file-upload"
              >
                <UploadIcon className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  {selectedFiles.length > 0
                    ? trans('admin.media.files_selected', { count: selectedFiles.length.toString() })
                    : trans('admin.media.select_files')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{trans('admin.media.max_files')}</p>
              </label>
              <input
                accept="image/*"
                className="hidden"
                id="file-upload"
                multiple
                type="file"
                onChange={handleFileSelect}
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border p-3">
                <p className="mb-2 text-sm font-medium">{trans('admin.media.selected_files')}:</p>
                <ul className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setSelectedFiles([]);
              }}
            >
              {trans('admin.common.cancel')}
            </Button>
            <Button disabled={selectedFiles.length === 0 || isUploading} onClick={handleUpload}>
              {isUploading ? trans('admin.common.uploading') : trans('admin.common.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{trans('admin.media.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {trans('admin.media.delete_confirm_description')}
              {!!imageToDelete && <span className="mt-2 block font-medium">{imageToDelete.name}</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{trans('admin.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {trans('admin.common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}