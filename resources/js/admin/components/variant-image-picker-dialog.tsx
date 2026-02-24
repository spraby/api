import {useCallback, useRef, useState} from 'react';

import {ImageOffIcon, Loader2} from 'lucide-react';
import {toast} from 'sonner';

import {ImagePicker} from '@/components/image-picker';
import type {ImageSelectorItem} from '@/components/image-selector';
import {ImageUploader} from '@/components/image-uploader';
import type {UploadedImage} from '@/components/image-uploader';
import {MediaThumbnail} from '@/components/media-thumbnail';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {useLang} from '@/lib/lang';
import {useDialog} from '@/stores/dialog';

export interface PickableImage {
    id: number;
    url?: string | null;
    alt?: string | null;
    name?: string | null;
}

function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

interface VariantImagePickerDialogProps {
    images: PickableImage[];
    selectedId: number | null;
    disabled?: boolean;
    /** If provided (edit mode), enables media/upload tabs */
    productId?: number;
    /** compact size for use inside table row */
    size?: 'sm' | 'md';
    onSelect: (id: number | null, url?: string) => void;
    onNewImageAttached?: (img: PickableImage) => void;
}

export function VariantImagePickerDialog({
    images,
    selectedId,
    disabled,
    productId,
    size = 'md',
    onSelect,
    onNewImageAttached,
}: VariantImagePickerDialogProps) {
    const {t} = useLang();
    const {openDialog, closeDialog} = useDialog();
    const [attaching, setAttaching] = useState(false);

    // Refs for media picker state (inside dialog, avoids stale closures)
    const mediaSelectedRef = useRef<ImageSelectorItem[]>([]);

    const selectedImage = images.find(img => img.id === selectedId) ?? null;

    /**
     * Attach an existing image (images.id) to the product → returns product_image data.
     */
    const attachImageById = useCallback(async (imageId: number): Promise<PickableImage | null> => {
        if (!productId) {return null;}

        if (process.env.NODE_ENV !== 'production') {
            console.log('[VariantImagePickerDialog] attachImageById', {imageId, productId});
        }

        const csrfToken = getCsrfToken();
        try {
            const resp = await fetch(route('admin.products.images.api.attach', {product: productId}), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({image_id: imageId}),
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                console.error('[VariantImagePickerDialog] attach failed', {imageId, status: resp.status, err});
                toast.error(t('admin.products_edit.variant_image_attach_error'));
                return null;
            }

            const data = await resp.json();

            if (process.env.NODE_ENV !== 'production') {
                console.log('[VariantImagePickerDialog] attached', {productImageId: data.id, url: data.image?.url});
            }

            return {
                id: data.id,
                url: data.image?.url ?? null,
                name: data.image?.name ?? null,
                alt: data.image?.alt ?? null,
            };
        } catch (err) {
            console.error('[VariantImagePickerDialog] attach error', err);
            toast.error(t('admin.products_edit.variant_image_attach_error'));
            return null;
        }
    }, [productId, t]);

    const handleSelect = useCallback((id: number | null) => {
        onSelect(id);
        closeDialog();
    }, [onSelect, closeDialog]);

    const handleMediaChoose = useCallback(async () => {
        const items = mediaSelectedRef.current;

        if (items.length === 0) {return;}

        const imageId = Number(items[0].uid);

        setAttaching(true);
        const attached = await attachImageById(imageId);

        setAttaching(false);

        if (attached) {
            onNewImageAttached?.(attached);
            onSelect(attached.id);
            closeDialog();
        }
    }, [attachImageById, onNewImageAttached, onSelect, closeDialog]);

    const handleUploadFinish = useCallback(async (uploadedImages: UploadedImage[]) => {
        if (uploadedImages.length === 0) {return;}

        const imageId = Number(uploadedImages[0].id);

        setAttaching(true);
        const attached = await attachImageById(imageId);

        setAttaching(false);

        if (attached) {
            onNewImageAttached?.(attached);
            onSelect(attached.id);
            closeDialog();
        }
    }, [attachImageById, onNewImageAttached, onSelect, closeDialog]);

    const handleOpen = useCallback(() => {
        mediaSelectedRef.current = [];

        const hasMediaTabs = !!productId;

        openDialog({
            title: t('admin.products_edit.fields.variant_image'),
            className: 'max-w-[640px]',
            content: (
                <div className="flex flex-col gap-3 p-1">
                    {hasMediaTabs ? (
                        <Tabs defaultValue="product">
                            <TabsList className="w-full">
                                <TabsTrigger value="product" className="flex-1">
                                    {t('admin.products_edit.variant_image_tab_product')}
                                </TabsTrigger>
                                <TabsTrigger value="media" className="flex-1">
                                    {t('admin.products_edit.variant_image_tab_media')}
                                </TabsTrigger>
                                <TabsTrigger value="upload" className="flex-1">
                                    {t('admin.products_edit.variant_image_tab_upload')}
                                </TabsTrigger>
                            </TabsList>

                            {/* Tab: Product images */}
                            <TabsContent value="product" className="mt-3">
                                {images.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                        {t('admin.products_edit.variant_image_no_product_images')}
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 max-h-[400px] overflow-y-auto">
                                        {images.map((img, index) => (
                                            <button
                                                key={img.id}
                                                type="button"
                                                className="cursor-pointer rounded ring-2 ring-transparent transition-all hover:ring-primary focus:outline-none focus:ring-primary data-[selected=true]:ring-primary"
                                                data-selected={img.id === selectedId}
                                                onClick={() => handleSelect(img.id)}
                                            >
                                                <MediaThumbnail
                                                    url={img.url}
                                                    alt={img.alt}
                                                    name={img.name}
                                                    isFirst={index === 0}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Tab: Media library */}
                            <TabsContent value="media" className="mt-3">
                                <div className="flex flex-col gap-3">
                                    <ImagePicker
                                        resource={route('admin.media.api.index')}
                                        multiple={false}
                                        onChange={items => {
                                            mediaSelectedRef.current = items;
                                        }}
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            size="sm"
                                            disabled={attaching}
                                            onClick={handleMediaChoose}
                                        >
                                            {attaching && <Loader2 className="size-4 mr-2 animate-spin" />}
                                            {attaching
                                                ? t('admin.products_edit.variant_image_attaching')
                                                : t('admin.products_edit.variant_image_choose_btn')}
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Tab: Upload new */}
                            <TabsContent value="upload" className="mt-3">
                                {attaching ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            {t('admin.products_edit.variant_image_attaching')}
                                        </span>
                                    </div>
                                ) : (
                                    <ImageUploader
                                        multiple={false}
                                        onFinishLoading={handleUploadFinish}
                                    />
                                )}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        /* Create mode or no productId: product images only */
                        <div className="flex flex-col gap-3">
                            {images.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    {t('admin.products_edit.images.no_images')}
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {images.map((img, index) => (
                                        <button
                                            key={img.id}
                                            type="button"
                                            className="cursor-pointer rounded ring-2 ring-transparent transition-all hover:ring-primary focus:outline-none focus:ring-primary data-[selected=true]:ring-primary"
                                            data-selected={img.id === selectedId}
                                            onClick={() => handleSelect(img.id)}
                                        >
                                            <MediaThumbnail
                                                url={img.url}
                                                alt={img.alt}
                                                name={img.name}
                                                isFirst={index === 0}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ),
            footer: selectedId !== null ? (
                <Button variant="ghost" size="sm" onClick={() => handleSelect(null)}>
                    <ImageOffIcon className="size-4" />
                    {t('admin.products_edit.variants.confirm_remove_image')}
                </Button>
            ) : undefined,
        });
    }, [images, selectedId, productId, attaching, handleSelect, handleMediaChoose, handleUploadFinish, openDialog, t]);

    const buttonSizeClass = size === 'sm' ? 'size-10' : 'size-16';

    return (
        <button
            type="button"
            disabled={disabled}
            className={`${buttonSizeClass} cursor-pointer overflow-hidden rounded border border-dashed border-muted-foreground/40 transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50`}
            onClick={handleOpen}
        >
            {selectedImage !== null ? (
                <MediaThumbnail
                    url={selectedImage.url}
                    alt={selectedImage.alt}
                    name={selectedImage.name}
                />
            ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageOffIcon className={size === 'sm' ? 'size-4' : 'size-5'} />
                </div>
            )}
        </button>
    );
}
