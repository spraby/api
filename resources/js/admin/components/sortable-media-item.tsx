import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {MediaThumbnail} from '@/components/media-thumbnail';
import {cn} from '@/lib/utils';

interface SortableMediaItemProps {
    id: string;
    url?: string | null;
    alt?: string | null;
    name?: string | null;
    isFirst?: boolean;
    isDragging?: boolean;
    onDelete?: () => void;
}

export function SortableMediaItem({id, url, alt, name, isFirst, isDragging, onDelete}: SortableMediaItemProps) {
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
                isDragging && 'z-10 shadow-lg opacity-80',
            )}
            {...attributes}
            {...listeners}
        >
            <MediaThumbnail
                url={url}
                alt={alt}
                name={name}
                isFirst={isFirst}
                onDelete={onDelete}
            />
        </div>
    );
}
