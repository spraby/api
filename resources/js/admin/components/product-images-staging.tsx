import {useState} from 'react';

import {GripVerticalIcon, ImageIcon, ImagesIcon, Trash2Icon} from 'lucide-react';

import {ImagePicker} from '@/components/image-picker';
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import type {Image as ApiImage} from "@/types/api";
import type {Image, StagedImage} from "@/types/models";

interface ProductImagesStagingProps {
    stagedImages: StagedImage[];
    onAddUploads: (files: File[]) => void;
    onAddExisting: (images: Image[]) => void;
    onRemove: (tempId: string) => void;
    onReorder: (tempIds: string[]) => void;
    disabled?: boolean;
}

export function ProductImagesStaging({
    stagedImages,
    onAddUploads,
    onAddExisting,
    onRemove,
    onReorder,
    disabled = false,
}: ProductImagesStagingProps) {
    const {t} = useLang();
    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

    const handleUpload = (files: File[]) => {
        onAddUploads(files);
        setImagePickerOpen(false);
    };

    const handleMediaSelect = (_imageIds: number[], images?: ApiImage[]) => {
        if (images?.length) {
            // Convert API Image to model Image (compatible shape)
            const modelImages: Image[] = images.map(img => ({
                id: img.id,
                name: img.name,
                src: img.src,
                url: img.url,
                alt: img.alt,
            }));

            onAddExisting(modelImages);
        }
        setImagePickerOpen(false);
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

        const newImages = [...stagedImages];
        const [removed] = newImages.splice(draggedIndex, 1);

        if (!removed) {return;}
        newImages.splice(draggedOverIndex, 0, removed);

        onReorder(newImages.map(img => img.tempId));

        setDraggedIndex(null);
        setDraggedOverIndex(null);
    };

    // Exclude existing images that are already staged
    const excludedBaseImageIds = stagedImages
        .filter((img): img is StagedImage & { image: Image & { id: number } } =>
            img.type === 'existing' && img.image?.id != null)
        .map(img => img.image.id);

    const addButtonMarkup = (
        <Button
            disabled={disabled}
            size="sm"
            type="button"
            variant="secondary"
            onClick={() => setImagePickerOpen(true)}
            title={t('admin.products_edit.images.add_images')}
        >
            <ImagesIcon className="size-4"/>
        </Button>
    );

    return (
        <div className="space-y-4">
            {stagedImages.length > 0 ? (
                <div className="grid gap-5 grid-cols-12">
                    {stagedImages.map((stagedImage, index) => (
                        <div
                            key={stagedImage.tempId}
                            role="button"
                            tabIndex={!disabled ? 0 : -1}
                            className={cn(
                                'group relative overflow-hidden transition-all',
                                draggedIndex === index && 'opacity-50',
                                draggedOverIndex === index && 'ring-2 ring-primary',
                                index === 0 ? 'col-span-4 row-span-4' : 'col-span-2 row-span-2',
                            )}
                            draggable={!disabled}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragStart={() => handleDragStart(index)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div>
                                {!disabled && (
                                    <div className="absolute left-2 top-2 cursor-move rounded-md bg-background p-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <GripVerticalIcon className="size-6 text-muted-foreground"/>
                                    </div>
                                )}

                                {stagedImage.previewUrl ? (
                                    <img
                                        alt={`Staged ${index + 1}`}
                                        className="aspect-square w-full rounded-md border object-cover"
                                        src={stagedImage.previewUrl}
                                    />
                                ) : (
                                    <div className="flex aspect-square w-full items-center justify-center rounded-md border bg-muted">
                                        <ImageIcon className="size-12 text-muted-foreground"/>
                                    </div>
                                )}

                                {!disabled && (
                                    <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                            className="p-1"
                                            size="icon"
                                            type="button"
                                            variant="secondary"
                                            onClick={() => onRemove(stagedImage.tempId)}
                                        >
                                            <Trash2Icon className="size-2"/>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="group relative overflow-hidden transition-all col-span-2 row-span-2">
                        <div className="flex justify-center items-center gap-2 rounded-lg border-2 border-dashed aspect-square w-full">
                            {addButtonMarkup}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
                    <ImageIcon className="mb-3 size-16 text-muted-foreground"/>
                    <div className="flex justify-end flex-wrap gap-2">
                        {addButtonMarkup}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t('admin.products_edit.images.no_images')}
                    </p>
                </div>
            )}

            <ImagePicker
                excludeImageIds={excludedBaseImageIds}
                multiple
                open={imagePickerOpen}
                onOpenChange={setImagePickerOpen}
                onSelect={handleMediaSelect}
                onUpload={handleUpload}
            />
        </div>
    );
}
