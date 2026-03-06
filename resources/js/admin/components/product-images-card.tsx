import {useCallback, useEffect, useMemo, useState} from 'react';

import {DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent} from '@dnd-kit/core';
import {SortableContext, arrayMove, rectSortingStrategy, useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {ImageIcon, TrashIcon} from 'lucide-react';

import {ConfirmationPopover} from '@/components/confirmation-popover';
import {ImagePickerDialog} from '@/components/image-picker-dialog';
import type {ImageSelectorItem} from '@/components/image-selector';
import {Badge} from '@/components/ui/badge';
import {Card} from '@/components/ui/card';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import type {Product, ProductImage} from '@/types/data';

interface ImageThumbnailProps {
    url: string;
    alt?: string | null;
    name: string;
    isFirst?: boolean;
    badgeLabel?: string;
    onRemove?: () => void;
    className?: string;
}

function ImageThumbnail({url, alt, name, isFirst, badgeLabel, onRemove, className}: ImageThumbnailProps) {
    const {t} = useLang();

    return (
        <div
            className={cn(
                'group relative aspect-square overflow-hidden rounded-xl border-2 bg-muted transition-shadow hover:shadow-md',
                isFirst ? 'border-primary ring-1 ring-primary/20' : 'border-border',
                className,
            )}
        >
            <img
                src={url}
                alt={alt ?? name}
                className="size-full object-cover"
                draggable={false}
            />

            {/* Badges */}
            {isFirst ? (
                <Badge className="absolute left-1.5 top-1.5 px-1.5 py-0 text-[10px]">
                    {t('admin.products_edit.main_badge')}
                </Badge>
            ) : null}
            {badgeLabel ? (
                <Badge
                    variant="secondary"
                    className="absolute right-1.5 top-1.5 bg-black/50 px-1.5 py-0 text-[9px] text-white hover:bg-black/50"
                >
                    {badgeLabel}
                </Badge>
            ) : null}

            {/* Bottom filename */}
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-2 pb-1.5 pt-5">
                <p className="truncate text-[10px] text-white/80">
                    {name}
                </p>
            </div>

            {/* Delete button — top-right corner with confirmation popover */}
            {onRemove != null && (
                <ConfirmationPopover
                    message={t('admin.products_edit.confirm_delete_local_image')}
                    onConfirm={onRemove}
                    trigger={
                        <button
                            type="button"
                            onPointerDown={e => e.stopPropagation()}
                            title={t('admin.products_edit.delete_btn')}
                            className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                        >
                            <TrashIcon className="size-3.5"/>
                        </button>
                    }
                />
            )}
        </div>
    );
}

interface SortableImageThumbnailProps extends Omit<ImageThumbnailProps, 'className'> {
    id: string;
    isDragging?: boolean;
}

function SortableImageThumbnail({id, isDragging, isFirst, ...thumbnailProps}: SortableImageThumbnailProps) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'cursor-grab active:cursor-grabbing',
                isFirst && 'col-span-2 row-span-2',
                isDragging && 'z-10 opacity-80 shadow-lg',
            )}
            {...attributes}
            {...listeners}
        >
            <ImageThumbnail {...thumbnailProps} isFirst={isFirst}/>
        </div>
    );
}

function EmptyState() {
    const {t} = useLang();

    return (
        <div
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="size-6 text-muted-foreground"/>
            </div>
            <p className="text-sm text-muted-foreground">
                {t('admin.products_edit.no_images_short')}
            </p>
        </div>
    );
}

interface Props {
    product: Product;
    isEdit: boolean;
    onLibraryImagesAdd?: (images: ImageSelectorItem[]) => void;
    onLibraryImageRemove?: (uid: string) => void;
    onReorder?: (images: ProductImage[]) => void;
}

export function ProductImagesCard({
                                      product,
                                      isEdit,
                                      onLibraryImagesAdd,
                                      onLibraryImageRemove,
                                      onReorder,
                                  }: Props) {
    const {t} = useLang();

    const sortedImages = useMemo(
        () => [...(product.images ?? [])].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0)),
        [product.images],
    );

    const [orderedImages, setOrderedImages] = useState<ProductImage[]>(sortedImages);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    useEffect(() => {
        setOrderedImages([...(product.images ?? [])].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0)));
    }, [product.images]);

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 5}}),
    );

    const sortableIds = useMemo(
        () => orderedImages.map(pi => pi.uid),
        [orderedImages],
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setDraggingId(null);
        const {active, over} = event;

        if (!over || active.id === over.id) {
            return;
        }

        setOrderedImages(prev => {
            const oldIndex = prev.findIndex(pi => pi.uid === String(active.id));
            const newIndex = prev.findIndex(pi => pi.uid === String(over.id));
            const reordered = arrayMove(prev, oldIndex, newIndex).map((pi, i) => ({...pi, position: i}));

            onReorder?.(reordered);

            return reordered;
        });
    }, [onReorder]);

    // ── Image picker handler ────────────────────────────────────────────────

    const handleImagesChosen = useCallback((images: ImageSelectorItem[]) => {
        if (images.length === 0) {
            return;
        }

        onLibraryImagesAdd?.(images);
    }, [onLibraryImagesAdd]);

    // ── Image grid ────────────────────────────────────────────────────────

    const hasImages = orderedImages.length > 0;

    const imageGrid = (
        <DndContext
            collisionDetection={closestCenter}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDragStart={({active}) => setDraggingId(String(active.id))}
            onDragCancel={() => setDraggingId(null)}
        >
            <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-2">
                    {orderedImages.map((pi, index) => (
                        <SortableImageThumbnail
                            key={pi.uid}
                            id={pi.uid}
                            url={pi.image?.url ?? ''}
                            alt={pi.image?.alt}
                            name={pi.image?.name ?? ''}
                            isFirst={index === 0}
                            isDragging={draggingId === pi.uid}
                            onRemove={() => onLibraryImageRemove?.(pi.uid)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <Card className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <ImagePickerDialog onChoose={handleImagesChosen}/>
            </div>

            {hasImages ? imageGrid : <EmptyState/>}
        </Card>
    );
}
