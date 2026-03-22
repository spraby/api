import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';

import {Loader2} from 'lucide-react';
import {toast} from 'sonner';

import {ImageSelector, type ImageSelectorItem} from '@/components/image-selector';
import {ImageUploader} from '@/components/image-uploader';
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import {type Image} from "@/types/data.ts";

interface ApiPaginatedResponse {
    data: Image[];
    meta: {
        current_page: number;
        last_page: number;
    };
}

interface ResourceImageSelectorHandle {
    refresh: () => void;
}

interface Props {
    resource?: string;
    images?: ImageSelectorItem[];
    perPage?: number;
    multiple?: boolean;
    onChange?: (selected: ImageSelectorItem[]) => void;
}

/**
 *
 * @param resource
 * @param images
 * @param perPage
 * @param multiple
 * @param onChange
 * @constructor
 */
export function ImagePicker({
                                resource,
                                images = [],
                                perPage = 24,
                                multiple = true,
                                onChange,
                            }: Props) {
    const [selectedImages, setSelectedImages] = useState<ImageSelectorItem[]>([]);
    const [loadedImages, setLoadedImages] = useState<ImageSelectorItem[]>([]);
    const resourceSelectorRef = useRef<ResourceImageSelectorHandle>(null);

    useEffect(() => {
        if (onChange) {
            onChange(selectedImages);
        }
    }, [selectedImages, onChange]);

    /**
     *
     */
    const handleStartLoading = useCallback((previews: { uid: string; url: string; name: string }[]) => {
        const items: ImageSelectorItem[] = previews.map((p) => ({
            uid: p.uid,
            url: p.url,
            name: p.name,
            loading: true,
        }));

        setLoadedImages(items);
    }, []);

    /**
     *
     */
    const handleFinishLoading = useCallback(() => {
        setLoadedImages([]);
        resourceSelectorRef.current?.refresh();
    }, []);

    return (
        <div className="space-y-4 p-5">
            <ImageUploader
                multiple={multiple}
                onStartLoading={handleStartLoading}
                onFinishLoading={handleFinishLoading}
            />
            <div className="min-h-[200px] max-h-[500px] overflow-auto flex flex-col gap-5">
                {
                    !!images?.length && <DataImageSelector
                        images={images}
                        multiple={multiple}
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                    />
                }
                {
                    !!resource && <ResourceImageSelector
                        ref={resourceSelectorRef}
                        loadedImages={loadedImages}
                        resource={resource}
                        multiple={multiple}
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                        perPage={perPage}
                        excludeIds={images.filter((i): i is ImageSelectorItem & { id: number } => i.id != null).map(i => i.id)}
                    />
                }
            </div>
        </div>
    );
}

/**
 *
 * @param images
 * @param selectedImages
 * @param setSelectedImages
 * @param multiple
 * @constructor
 */
const DataImageSelector = ({images, selectedImages, setSelectedImages, multiple = false}: {
    images: ImageSelectorItem[]
    multiple: boolean,
    selectedImages: ImageSelectorItem[],
    setSelectedImages: (selected: ImageSelectorItem[]) => void
}) => {

    const handleSelectionChange = useCallback((values: string[]) => {
        if (setSelectedImages) {
            setSelectedImages(images.filter(img => values.includes(img.uid)));
        }
    }, [setSelectedImages, images]);

    return <ImageSelector
        onChange={handleSelectionChange}
        values={selectedImages.map(i => i.uid)}
        multiple={multiple}
        images={images}
    />
}

/**
 *
 */
const ResourceImageSelector = forwardRef<ResourceImageSelectorHandle, {
    loadedImages: ImageSelectorItem[],
    resource: string,
    multiple: boolean,
    selectedImages: ImageSelectorItem[],
    setSelectedImages: (selected: ImageSelectorItem[]) => void,
    perPage?: number;
    excludeIds?: number[];
}>(({resource, multiple = false, selectedImages, setSelectedImages, perPage = 24, loadedImages = [], excludeIds = []}, ref) => {
    const {t} = useLang();

    const [images, setImages] = useState<ImageSelectorItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    const abortControllerRef = useRef<AbortController | null>(null);
    const loadMoreControllerRef = useRef<AbortController | null>(null);
    const loadingMoreRef = useRef(false);

    useEffect(() => {
        if (loadedImages.length > 0) {
            setImages((prev) => [...loadedImages, ...prev]);
        }
    }, [loadedImages]);

    const handleSelectionChange = useCallback((values: string[]) => {
        if (setSelectedImages) {
            setSelectedImages(images.filter(img => values.includes(img.uid)));
        }
    }, [setSelectedImages, images]);

    const fetchPage = useCallback(async (page: number, signal?: AbortSignal) => {
        const url = new URL(resource, window.location.origin);

        url.searchParams.set('page', String(page));
        url.searchParams.set('per_page', String(perPage));
        if (excludeIds.length > 0) {
            url.searchParams.set('exclude_ids', excludeIds.join(','));
        }

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
            id: img.id,
            uid: img.uid,
            url: img.url,
            name: img.name,
            alt: img.alt,
        }));

        setImages(prev => page === 1 ? items : [...prev, ...items]);
        setCurrentPage(json.meta.current_page);
        setLastPage(json.meta.last_page);
    }, [resource, perPage, t, excludeIds]);

    const resetAndFetch = useCallback(() => {
        abortControllerRef.current?.abort();
        loadMoreControllerRef.current?.abort();
        loadingMoreRef.current = false;

        const controller = new AbortController();

        abortControllerRef.current = controller;

        setImages([]);
        setCurrentPage(0);
        setLastPage(1);
        setLoading(true);

        void fetchPage(1, controller.signal)
            .catch(() => {
            })
            .finally(() => setLoading(false));

        return controller;
    }, [fetchPage]);

    useImperativeHandle(ref, () => ({
        refresh: () => {
            resetAndFetch();
        },
    }), [resetAndFetch]);

    useEffect(() => {
        const controller = resetAndFetch();

        return () => {
            controller.abort();
            loadMoreControllerRef.current?.abort();
        };
    }, [resource, resetAndFetch]);

    const loadMore = () => {
        if (currentPage >= lastPage || loadingMoreRef.current) {
            return;
        }

        loadMoreControllerRef.current?.abort();
        const controller = new AbortController();

        loadMoreControllerRef.current = controller;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        void fetchPage(currentPage + 1, controller.signal)
            .catch(() => {
            })
            .finally(() => {
                loadingMoreRef.current = false;
                setLoadingMore(false);
            });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    return <div className="flex flex-col gap-5">
        <ImageSelector
            onChange={handleSelectionChange}
            values={selectedImages.map(i => i.uid)}
            multiple={multiple}
            images={images}
        />
        {(currentPage < lastPage) ? (
            <div className="flex justify-center">
                <Button
                    size="sm"
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
});
