import {ImageIcon, XIcon} from 'lucide-react';

import {cn} from '@/lib/utils';

interface MediaThumbnailProps {
    url?: string | null;
    alt?: string | null;
    name?: string | null;
    isFirst?: boolean;
    onDelete?: () => void;
    className?: string;
}

export function MediaThumbnail({url, alt, name, isFirst, onDelete, className}: MediaThumbnailProps) {
    return (
        <div
            className={cn(
                'group relative aspect-square overflow-hidden rounded-md border bg-muted',
                isFirst && 'col-span-2 row-span-2',
                className,
            )}
        >
            {url ? (
                <img
                    alt={alt ?? name ?? ''}
                    className="size-full object-cover"
                    draggable={false}
                    src={url}
                />
            ) : (
                <div className="flex size-full items-center justify-center">
                    <ImageIcon className="size-6 text-muted-foreground"/>
                </div>
            )}
            {onDelete !== undefined && (
                <button
                    type="button"
                    className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={onDelete}
                >
                    <XIcon className="size-3.5"/>
                </button>
            )}
        </div>
    );
}
