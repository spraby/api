import { useState } from 'react';

import { router } from '@inertiajs/react';
import { ImageIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { ImagePicker } from '@/components/image-picker';
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
import AdminLayout from '@/layouts/AdminLayout';
import { useLang } from '@/lib/lang';
import type { PageProps } from '@/types/inertia';
import type { Image as ImageModel, PaginatedData } from '@/types/models';

// Declare global route function from Ziggy
declare function route(name: string, params?: Record<string, unknown>): string;

interface MediaProps extends PageProps {
  images: PaginatedData<ImageModel>;
}

export default function Media({ images }: MediaProps) {
  const { trans } = useLang();

  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ImageModel | null>(null);

  const handleUpload = (files: File[]) => {
    if (files.length === 0) {
      toast.error(trans('admin.media.no_files_selected'));

      return;
    }

    if (files.length > 50) {
      toast.error(trans('admin.media.max_files_error'));

      return;
    }

    setIsUploading(true);

    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    router.post(route('admin.media.store'), formData, {
      preserveScroll: true,
      onSuccess: () => {
        setImagePickerOpen(false);
      },
      onError: (errors) => {
        const errorMessage = Object.values(errors).flat().join(', ');

        toast.error(errorMessage);
      },
      onFinish: () => {
        setIsUploading(false);
      },
    });
  };

  const confirmDelete = (image: ImageModel) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!imageToDelete) {return;}

    router.delete(route('admin.media.destroy', { image: imageToDelete.id }), {
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
          <Button onClick={() => { setImagePickerOpen(true); }}>
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
            <Button className="mt-4" onClick={() => { setImagePickerOpen(true); }}>
              <PlusIcon className="mr-2 h-4 w-4" />
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
                router.get(route('admin.media'), { page: images.current_page - 1 });
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
                router.get(route('admin.media'), { page: images.current_page + 1 });
              }}
            >
              {trans('admin.pagination.next')}
            </Button>
          </div>
        )}
      </div>

      {/* Image Picker Dialog (upload only) */}
      <ImagePicker
        hideLibrary
        isUploading={isUploading}
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onUpload={handleUpload}
      />

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