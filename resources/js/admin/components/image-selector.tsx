import {Check, Loader2} from 'lucide-react';

import {cn} from '@/lib/utils';

export interface ImageSelectorItem {
    uid: string;
    url: string;
    name: string;
    alt?: string | null;
    loading?: boolean;
}

type ImageSelectorProps = {
    images: ImageSelectorItem[];
    className?: string;
    columns?: 3 | 4 | 5 | 6 | 8 | 12;
    multiple?: boolean;
    values?: string[];
    onChange?: (value: string[]) => void;
}

const columnClasses = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    8: 'grid-cols-8',
    12: 'grid-cols-12',
} as const;

/**
 *
 * @param images
 * @param values
 * @param onChange
 * @param multiple
 * @param columns
 * @param className
 * @constructor
 */
export function ImageSelector({
                                  images,
                                  values,
                                  onChange,
                                  multiple = false,
                                  columns = 8,
                                  className,
                              }: ImageSelectorProps) {
    /**
     *
     */
    const current = values ?? [];

    /**
     *
     * @param uid
     */
    const isSelected = (uid: string): boolean => current.includes(uid);

    /**
     *
     * @param uid
     * @param loading
     */
    const handleClick = (uid: string, loading?: boolean) => {
        if (!onChange || loading) return;

        if (multiple) {
            const next = current.includes(uid) ? current.filter((v) => v !== uid) : [...current, uid];
            onChange(next);
        } else {
            onChange(current.includes(uid) ? [] : [uid]);
        }
    };

    return (
        <div className={cn('grid gap-2', columnClasses[columns], className)}>
            {images.map((image) => (
                <button
                    key={image.uid}
                    type="button"
                    disabled={image.loading}
                    onClick={() => handleClick(image.uid, image.loading)}
                    className={cn(
                        'relative aspect-square overflow-hidden rounded-md border-2 transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        'hover:opacity-90',
                        image.loading && 'pointer-events-none opacity-60',
                        isSelected(image.uid)
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-muted hover:border-muted-foreground/30',
                    )}
                >
                    <img
                        src={image.url}
                        alt={image.alt ?? image.name}
                        className={cn(
                            'h-full w-full object-cover',
                            image.loading && 'blur-[1px]',
                        )}
                    />

                    {image.loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                            <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                        </div>
                    ) : null}

                    {isSelected(image.uid) && !image.loading ? (
                        <div
                            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3 w-3"/>
                        </div>
                    ) : null}
                </button>
            ))}
        </div>
    );
}
