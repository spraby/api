import {useCallback} from 'react';

import {ImageOffIcon} from 'lucide-react';

import {MediaThumbnail} from '@/components/media-thumbnail';
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import {useDialog} from '@/stores/dialog';

export interface PickableImage {
    id: number;
    url?: string | null;
    alt?: string | null;
    name?: string | null;
}

interface VariantImagePickerDialogProps {
    images: PickableImage[];
    selectedId: number | null;
    disabled?: boolean;
    onSelect: (id: number | null) => void;
}

export function VariantImagePickerDialog({images, selectedId, disabled, onSelect}: VariantImagePickerDialogProps) {
    const {t} = useLang();
    const {openDialog, closeDialog} = useDialog();

    const selectedImage = images.find(img => img.id === selectedId) ?? null;

    const handleSelect = useCallback((id: number | null) => {
        onSelect(id);
        closeDialog();
    }, [onSelect, closeDialog]);

    const handleOpen = useCallback(() => {
        openDialog({
            title: t('admin.products_edit.fields.variant_image'),
            className: 'max-w-[600px]',
            content: (
                <div className="flex flex-col gap-3">
                    {images.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            {t('admin.products_edit.images.no_images')}
                        </p>
                    )}
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
                </div>
            ),
            footer: selectedId !== null ? (
                <Button variant="ghost" size="sm" onClick={() => handleSelect(null)}>
                    <ImageOffIcon className="size-4"/>
                    {t('admin.products_edit.variants.confirm_remove_image')}
                </Button>
            ) : undefined,
        });
    }, [images, selectedId, handleSelect, openDialog, t]);

    return (
        <button
            type="button"
            disabled={disabled}
            className="size-16 cursor-pointer overflow-hidden rounded border border-dashed border-muted-foreground/40 transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
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
                    <ImageOffIcon className="size-5"/>
                </div>
            )}
        </button>
    );
}
