import {useCallback, useEffect, useRef, useState} from 'react';

import {Loader2} from 'lucide-react';
import {toast} from 'sonner';

import {ImageSelector, type ImageSelectorItem} from '@/components/image-selector';
import {ImageUploader} from '@/components/image-uploader';
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';

interface ApiImage {
    id: number | string;
    url: string;
    name: string;
    alt?: string | null;
}

interface ApiPaginatedResponse {
    data: ApiImage[];
    meta: {
        current_page: number;
        last_page: number;
    };
}

interface Props {
    resource?: string;
    images?: ImageSelectorItem[];
    perPage?: number;
    multiple?: boolean;
    onChange?: (selected: string[]) => void;
}

export function ImagePicker({
                                resource,
                                images: staticImages = [],
                                perPage = 24,
                                multiple = true,
                                onChange,
                            }: Props) {
    const {t} = useLang();

    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [loadedImages, setLoadedImages] = useState<ImageSelectorItem[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(!!resource);
    const [loadingMore, setLoadingMore] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const loadingMoreRef = useRef(false);

    const handleSelectionChange = useCallback((values: string[]) => {
        setSelectedImages(values);
        onChange?.(values);
    }, [onChange]);

    const fetchPage = useCallback(async (page: number, signal?: AbortSignal) => {
        if (!resource) {
            return;
        }

        const url = new URL(resource, window.location.origin);

        url.searchParams.set('page', String(page));
        url.searchParams.set('per_page', String(perPage));

        const res = await fetch(url.toString(), {
            headers: {'Accept': 'application/json'},
            credentials: 'same-origin',
            signal,
        });

        if (!res.ok) {
            toast.error(t('image_picker.load_failed'));

            return;
        }

        const json: ApiPaginatedResponse = await res.json();

        const items: ImageSelectorItem[] = json.data.map(img => ({
            uid: String(img.id),
            url: img.url,
            name: img.name,
            alt: img.alt,
        }));

        setLoadedImages(prev => page === 1 ? items : [...prev, ...items]);
        setCurrentPage(json.meta.current_page);
        setLastPage(json.meta.last_page);
    }, [resource, perPage, t]);

    useEffect(() => {
        if (!resource) {
            return;
        }

        abortControllerRef.current?.abort();

        const controller = new AbortController();

        abortControllerRef.current = controller;

        setLoading(true);
        void fetchPage(1, controller.signal)
            .catch(() => {/* aborted */})
            .finally(() => setLoading(false));

        return () => {
            controller.abort();
        };
    }, [resource, fetchPage]);

    const loadMore = () => {
        if (!resource || currentPage >= lastPage || loadingMoreRef.current) {
            return;
        }

        loadingMoreRef.current = true;
        setLoadingMore(true);
        void fetchPage(currentPage + 1)
            .catch(() => {/* handled in fetchPage */})
            .finally(() => {
                loadingMoreRef.current = false;
                setLoadingMore(false);
            });
    };

    const handleStartLoading = useCallback((previews: { uid: string; url: string; name: string }[]) => {
        const items: ImageSelectorItem[] = previews.map((p) => ({
            uid: p.uid,
            url: p.url,
            name: p.name,
            loading: true,
        }));

        setLoadedImages((prev) => [...items, ...prev]);
    }, []);

    const handleFinishLoading = useCallback(() => {
        void fetchPage(1);
    }, [fetchPage]);

    const images = resource ? loadedImages : staticImages;
    const hasMore = resource && currentPage < lastPage;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-5">
            <ImageUploader
                multiple={multiple}
                onStartLoading={handleStartLoading}
                onFinishLoading={handleFinishLoading}
            />
            <ImageSelector
                onChange={handleSelectionChange}
                values={selectedImages}
                multiple={multiple}
                images={images}
            />
            {hasMore ? (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        {t('image_picker.load_more')}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
