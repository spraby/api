import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent} from '@dnd-kit/core';
import {SortableContext, arrayMove, rectSortingStrategy} from '@dnd-kit/sortable';
import {router} from '@inertiajs/react';
import {ImageIcon, StarIcon, TrashIcon} from 'lucide-react';

import {ImagePickerDialog} from '@/components/image-picker-dialog';
import type {ImageSelectorItem} from '@/components/image-selector';
import {SortableMediaItem} from '@/components/sortable-media-item';
import {StepHeader} from '@/components/step-header';
import {Card} from '@/components/ui/card';
import type {LocalImage} from '@/hooks/use-product-form';
import {cn} from '@/lib/utils';
import type {Product, ProductImage} from '@/types/models';

interface Props {
    product: Product;
    isEdit: boolean;
    localImages: LocalImage[];
    onLocalImagesAdd: (images: LocalImage[]) => void;
    onLocalImageRemove: (uid: string) => void;
    onLocalImageMakeFirst: (uid: string) => void;
}

export function ProductImagesCard({
    product,
    isEdit,
    localImages,
    onLocalImagesAdd,
    onLocalImageRemove,
    onLocalImageMakeFirst,
}: Props) {
    // ── Edit mode state ──────────────────────────────────────────────────────
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
        if (!confirm('Удалить изображение?')) {
            return;
        }

        setOrderedImages(prev => prev.filter(pi => pi.id !== productImageId));

        if (isEdit && product.id) {
            router.delete(
                route('admin.products.images.detach', {product: product.id, productImageId}),
                {preserveScroll: true},
            );
        }
    }, [isEdit, product.id]);

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
        }
    }, [isEdit, product.id]);

    // ── Create mode: file drag & drop ────────────────────────────────────────
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const processFiles = (files: FileList | File[]) => {
        const fileArray = Array.from(files).filter(
            f => f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/webp',
        );

        if (fileArray.length === 0) {
            return;
        }

        const newImages: LocalImage[] = fileArray.map(file => ({
            uid: Math.random().toString(36).slice(2),
            file,
            url: URL.createObjectURL(file),
            name: file.name,
        }));

        onLocalImagesAdd(newImages);
    };

    const handleDropZoneClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    };

    // ── Computed content (avoids nested ternary in JSX) ──────────────────────
    const editModeContent = orderedImages.length === 0
        ? <p className="text-sm text-muted-foreground">Нет изображений</p>
        : (
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

    const createModeContent = (
        <div className="flex flex-col gap-3">
            {/* Drop zone */}
            <button
                type="button"
                onClick={handleDropZoneClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors',
                    isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30',
                )}
            >
                <ImageIcon className="size-8 text-muted-foreground" />
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Перетащите изображения сюда
                    </p>
                    <p className="text-xs text-muted-foreground">
                        или нажмите для выбора файлов · JPG, PNG, WebP
                    </p>
                </div>
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
            />

            {/* Image grid */}
            {localImages.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
                    {localImages.map((img, index) => {
                        const isFirst = index === 0;

                        return (
                            <div
                                key={img.uid}
                                className={cn(
                                    'group relative aspect-square overflow-hidden rounded-xl border-2',
                                    isFirst ? 'border-primary' : 'border-border',
                                )}
                            >
                                <img
                                    src={img.url}
                                    alt={img.name}
                                    className="h-full w-full object-cover"
                                />

                                {/* Main badge */}
                                {isFirst ? (
                                    <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                                        ГЛАВНОЕ
                                    </span>
                                ) : null}

                                {/* Filename overlay */}
                                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-1.5 pb-1.5 pt-4">
                                    <p className="truncate font-mono text-[9px] text-white/80">
                                        {img.name}
                                    </p>
                                </div>

                                {/* Hover action buttons */}
                                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                    {!isFirst ? (
                                        <button
                                            type="button"
                                            onClick={() => onLocalImageMakeFirst(img.uid)}
                                            title="Сделать главным"
                                            className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-foreground hover:bg-white"
                                        >
                                            <StarIcon className="size-3.5" />
                                        </button>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => onLocalImageRemove(img.uid)}
                                        title="Удалить"
                                        className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-destructive hover:bg-white"
                                    >
                                        <TrashIcon className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <Card className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                    <StepHeader step={4} label="Изображения" />
                </div>
                {isEdit ? <ImagePickerDialog onChoose={handleImagesChosen} /> : null}
            </div>

            {isEdit ? editModeContent : createModeContent}
        </Card>
    );
}
