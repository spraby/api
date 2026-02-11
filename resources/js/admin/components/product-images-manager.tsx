import {useState} from 'react';

import {router} from '@inertiajs/react';
import {GripVerticalIcon, ImageIcon, ImagesIcon, Trash2Icon} from 'lucide-react';

import {ConfirmationPopover} from '@/components/confirmation-popover';
import {ImagePicker} from '@/components/image-picker';
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import type {ProductImage} from "@/types/models";

interface ProductImagesManagerProps {
    productId: number;
    images: ProductImage[]
    disabled?: boolean;
}

export function ProductImagesManager({
                                         productId,
                                         images,
                                         disabled = false,
                                     }: ProductImagesManagerProps) {
    const {t} = useLang();
    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const sortedImages = [...images].sort((a, b) => a.position - b.position);

    const handleMediaSelect = (imageIds: number[]) => {
        setIsProcessing(true);
        router.post(
            route('admin.products.images.attach', productId),
            {image_ids: imageIds},
            {
                preserveScroll: true,
                preserveState: false,
                onFinish: () => {
                    setIsProcessing(false);
                    setImagePickerOpen(false);
                },
            }
        );
    };

    const handleDelete = (productImageId: number) => {
        setIsProcessing(true);
        router.delete(
            route('admin.products.images.detach', {id: productId, productImageId}),
            {
                preserveScroll: true,
                preserveState: false,
                onFinish: () => {
                    setIsProcessing(false);
                },
            }
        );
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
            return;
        }
        newImages.splice(draggedOverIndex, 0, removed);

        const imageIds = newImages.map((img) => img.id);

        setIsProcessing(true);
        router.put(
            route('admin.products.images.reorder', productId),
            {image_ids: imageIds},
            {
                preserveScroll: true,
                preserveState: false,
                onFinish: () => {
                    setIsProcessing(false);
                },
            }
        );

        setDraggedIndex(null);
        setDraggedOverIndex(null);
    };

    const excludedImageIds = images.map((img) => img.image_id);

    const addButtonMarkup = (
        <Button
            disabled={disabled || isProcessing}
            size="sm"
            type="button"
            variant="secondary"
            onClick={() => {
                setImagePickerOpen(true);
            }}
            title={t('admin.products_edit.images.add_images')}
        >
            <ImagesIcon className="size-4"/>
        </Button>
    )

    return (
        <div className="space-y-4">


            {/* Images Grid */}
            {sortedImages.length > 0 ? (
                <div className="grid gap-5 grid-cols-12">
                    {sortedImages.map((productImage, index) => (
                        <div
                            key={productImage.id}
                            role="button"
                            tabIndex={!disabled && !isProcessing ? 0 : -1}
                            className={cn(
                                'group relative overflow-hidden transition-all ',
                                draggedIndex === index && 'opacity-50',
                                draggedOverIndex === index && 'ring-2 ring-primary',
                                index === 0 ? 'col-span-4 row-span-4' : 'col-span-2 row-span-2',
                            )}
                            draggable={!disabled && !isProcessing}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => {
                                handleDragOver(e, index);
                            }}
                            onDragStart={() => {
                                handleDragStart(index);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div>
                                {/* Drag Handle */}
                                {!disabled && !isProcessing && (
                                    <div
                                        className="absolute left-2 top-2 cursor-move rounded-md bg-background p-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <GripVerticalIcon className="size-6 text-muted-foreground"/>
                                    </div>
                                )}

                                {/* Image */}
                                {productImage?.image?.url ? (
                                    <img
                                        alt={`Product ${index + 1}`}
                                        className="aspect-square w-full rounded-md border object-cover"
                                        src={productImage?.image?.url}
                                    />
                                ) : (
                                    <div
                                        className="flex aspect-square w-full items-center justify-center rounded-md border bg-muted">
                                        <ImageIcon className="size-12 text-muted-foreground"/>
                                    </div>
                                )}

                                {/* Delete Button */}
                                {!disabled && !isProcessing && (
                                    <div
                                        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <ConfirmationPopover
                                            isLoading={isProcessing}
                                            message={t('admin.products_edit.images.confirm_delete')}
                                            trigger={
                                                <Button className="p-1" size="icon" type="button" variant="secondary">
                                                    <Trash2Icon className="size-2"/>
                                                </Button>
                                            }
                                            onConfirm={() => {
                                                handleDelete(productImage.id);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Action Buttons */}
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

            {/* Image Picker Dialog */}
            <ImagePicker
                excludeImageIds={excludedImageIds}
                multiple
                open={imagePickerOpen}
                onOpenChange={setImagePickerOpen}
                onSelect={handleMediaSelect}
            />
        </div>
    );
}
