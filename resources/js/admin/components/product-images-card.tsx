import {useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction} from 'react';

import {DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent} from '@dnd-kit/core';
import {arrayMove, SortableContext, rectSortingStrategy} from '@dnd-kit/sortable';
import {router} from '@inertiajs/react';

import {ImagePickerDialog} from '@/components/image-picker-dialog';
import type {ImageSelectorItem} from '@/components/image-selector';
import {MediaThumbnail} from '@/components/media-thumbnail';
import {SortableMediaItem} from '@/components/sortable-media-item';
import {Card} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {useLang} from '@/lib/lang';
import type {Product, ProductImage} from '@/types/models';

interface ProductImagesCardProps {
    product: Product;
    isEdit: boolean;
    stagedItems: ImageSelectorItem[];
    onStagedItemsChange: Dispatch<SetStateAction<ImageSelectorItem[]>>;
}

export function ProductImagesCard({product, isEdit, stagedItems, onStagedItemsChange}: ProductImagesCardProps) {
    const {t} = useLang();

    const sortedImages = useMemo(
        () => [...(product.images ?? [])].sort((a, b) => a.position - b.position),
        [product.images],
    );

    const [orderedImages, setOrderedImages] = useState<ProductImage[]>(sortedImages);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    useEffect(() => {
        setOrderedImages([...(product.images ?? [])].sort((a, b) => a.position - b.position));
    }, [product.images]);

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 5}}),
    );

    const sortableIds = useMemo(
        () => orderedImages.map(pi => String(pi.id)),
        [orderedImages],
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setDraggingId(null);
        const {active, over} = event;

        if (!over || active.id === over.id) {
            return;
        }

        setOrderedImages(prev => {
            const oldIndex = prev.findIndex(pi => String(pi.id) === String(active.id));
            const newIndex = prev.findIndex(pi => String(pi.id) === String(over.id));
            const reordered = arrayMove(prev, oldIndex, newIndex);

            if (isEdit && product.id) {
                router.put(
                    route('admin.products.images.reorder', {product: product.id}),
                    {image_ids: reordered.map(pi => pi.id)},
                    {preserveScroll: true},
                );
            }

            return reordered;
        });
    }, [isEdit, product.id]);

    const handleDeleteImage = useCallback((productImageId: number) => {
        // eslint-disable-next-line no-alert
        if (!confirm(t('admin.products_edit.images.confirm_delete'))) {
            return;
        }

        setOrderedImages(prev => prev.filter(pi => pi.id !== productImageId));

        if (isEdit && product.id) {
            router.delete(
                route('admin.products.images.detach', {product: product.id, productImageId}),
                {preserveScroll: true},
            );
        }
    }, [isEdit, product.id, t]);

    const handleImagesChosen = useCallback((images: ImageSelectorItem[]) => {
        if (images.length === 0) {
            return;
        }

        if (isEdit && product.id) {
            router.post(
                route('admin.products.images.attach', {product: product.id}),
                {image_ids: images.map(item => Number(item.uid))},
                {preserveScroll: true},
            );
        } else {
            onStagedItemsChange(prev => {
                const existingUids = new Set(prev.map(p => p.uid));

                return [...prev, ...images.filter(img => !existingUids.has(img.uid))];
            });
        }
    }, [isEdit, product.id, onStagedItemsChange]);

    const handleDeleteStagedImage = useCallback((uid: string) => {
        onStagedItemsChange(prev => prev.filter(item => item.uid !== uid));
    }, [onStagedItemsChange]);

    const imagesContent = isEdit
        ? renderEditMode()
        : renderCreateMode();

    function renderEditMode() {
        if (orderedImages.length === 0) {
            return <p className="text-sm text-muted-foreground">{t('admin.products_edit.images.no_images')}</p>;
        }

        return (
            <DndContext
                collisionDetection={closestCenter}
                sensors={sensors}
                onDragEnd={handleDragEnd}
                onDragStart={({active}) => setDraggingId(String(active.id))}
                onDragCancel={() => setDraggingId(null)}
            >
                <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {orderedImages.map((pi, index) => {
                            const {id} = pi;

                            return (
                                <SortableMediaItem
                                    key={id}
                                    id={String(id)}
                                    url={pi.image?.url}
                                    alt={pi.image?.alt}
                                    name={pi.image?.name}
                                    isFirst={index === 0}
                                    isDragging={draggingId === String(id)}
                                    onDelete={id !== undefined ? () => handleDeleteImage(id) : undefined}
                                />
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
        );
    }

    function renderCreateMode() {
        if (stagedItems.length === 0) {
            return <p className="text-sm text-muted-foreground">{t('admin.products_edit.images.no_images')}</p>;
        }

        return (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {stagedItems.map((item, index) => (
                    <MediaThumbnail
                        key={item.uid}
                        url={item.url}
                        alt={item.alt}
                        name={item.name}
                        isFirst={index === 0}
                        onDelete={() => handleDeleteStagedImage(item.uid)}
                    />
                ))}
            </div>
        );
    }

    return (
        <Card className="flex flex-col gap-3 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <Label>{t('admin.products_edit.sections.product_images')}</Label>
                <ImagePickerDialog onChoose={handleImagesChosen}/>
            </div>
            {imagesContent}
        </Card>
    );
}
