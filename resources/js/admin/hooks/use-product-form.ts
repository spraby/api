import {useCallback, useEffect, useRef, useState} from 'react';

import type {ImageSelectorItem} from '@/components/image-selector';
import type {CategoryWithOptions} from '@/components/product-category-card';
import type {OptionValue, ProductImage} from '@/types/models';

// ============================================================================
// Local types for form state
// ============================================================================

export interface LocalVariant {
    _key: string;
    id?: number;
    values: {option_id: number; option_value_id: number}[];
    /** Current selling price (maps to DB final_price on submit) */
    price: number;
    /** Original price before discount (maps to DB price on submit) */
    comparePrice: number;
    enabled: boolean;
    image_id: number | null;    // ProductImageId (FK to product_images, edit mode)
    image_index: number | null; // position in localImages array (create mode)
    image_url?: string | null;  // URL for display when image not in pickableImages (newly attached)
}

export interface LocalImage {
    uid: string;
    file: File;
    url: string; // createObjectURL(file)
    name: string;
}

// ============================================================================
// Helpers
// ============================================================================

function generateKey(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function serializeCombo(values: {option_id: number; option_value_id: number}[]): string {
    return [...values]
        .sort((a, b) => a.option_id - b.option_id)
        .map(v => `${v.option_id}:${v.option_value_id}`)
        .join(',');
}

function cartesian<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) {return [[]];}

    return arrays.reduce<T[][]>(
        (acc, arr) => acc.flatMap(combo => arr.map(item => [...combo, item])),
        [[]],
    );
}

// ============================================================================
// Hook
// ============================================================================

export interface ProductFormState {
    title: string;
    description: string;
    categoryId: number | null;
    /** optionId → selected optionValueIds */
    selectedValues: Record<number, number[]>;
    variants: LocalVariant[];
    localImages: LocalImage[];
    errors: Record<string, string>;

    // Basic field setters
    setTitle: (v: string) => void;
    setDescription: (v: string) => void;

    // Category & options
    selectCategory: (id: number) => void;
    toggleOptionValue: (optionId: number, valueId: number) => void;
    selectAllValues: (optionId: number, values: OptionValue[]) => void;
    deselectAllValues: (optionId: number) => void;

    // Variant generation
    generateVariants: (category: CategoryWithOptions) => void;
    computeCombinationCount: (category: CategoryWithOptions | null) => number;

    // Variant CRUD
    addVariant: (
        values: {option_id: number; option_value_id: number}[],
    ) => string | null;
    updateVariant: (key: string, patch: Partial<Omit<LocalVariant, '_key'>>) => void;
    deleteVariant: (key: string) => void;
    applyBulkPricing: (price: number | null, comparePrice: number | null) => void;

    // Images (create mode — file uploads)
    addLocalImages: (images: LocalImage[]) => void;
    removeLocalImage: (uid: string) => void;
    makeLocalImageFirst: (uid: string) => void;

    // Images (create mode — from media library)
    libraryImages: ImageSelectorItem[];
    addLibraryImages: (images: ImageSelectorItem[]) => void;
    removeLibraryImage: (uid: string) => void;
    clearLibraryImages: () => void;

    // Dirty tracking & reset
    isDirty: boolean;
    resetForm: () => void;

    // Validation & submission
    validate: () => boolean;
    clearError: (field: string) => void;
    buildSubmitPayload: (isEdit: boolean) => Record<string, unknown>;
}

export function useProductForm(initialProduct: {
    title?: string;
    description?: string | null;
    category_id?: number | null;
    initialSelectedValues?: Record<number, number[]>;
    variants?: {
        id?: number;
        price: string | number;
        final_price: string | number;
        enabled: boolean;
        image_id?: number | null;
        values?: {option_id: number; option_value_id: number}[];
    }[];
    images?: ProductImage[];
}, t: (key: string) => string): ProductFormState {
    // Compute initial data from Inertia props
    const initialData = {
        title: initialProduct.title ?? '',
        description: initialProduct.description ?? '',
        categoryId: initialProduct.category_id ?? null,
        selectedValues: initialProduct.initialSelectedValues ?? {},
        variantsData: (initialProduct.variants ?? []).map(v => ({
            id: v.id,
            comparePrice: Number(v.price) || 0,
            price: Number(v.final_price) || 0,
            enabled: v.enabled,
            image_id: v.image_id ?? null,
            values: v.values ?? [],
        })),
    };

    // Keep ref in sync with Inertia props so resetForm() uses fresh server data after redirect
    const initialDataRef = useRef(initialData);

    initialDataRef.current = initialData;

    const [title, setTitleState] = useState(initialProduct.title ?? '');
    const [description, setDescriptionState] = useState(initialProduct.description ?? '');
    const [categoryId, setCategoryId] = useState<number | null>(initialProduct.category_id ?? null);
    const [selectedValues, setSelectedValues] = useState<Record<number, number[]>>(
        initialProduct.initialSelectedValues ?? {},
    );
    const [variants, setVariants] = useState<LocalVariant[]>(() =>
        (initialProduct.variants ?? []).map(v => ({
            _key: generateKey(),
            id: v.id,
            // DB price = original/compare; DB final_price = current selling
            comparePrice: Number(v.price) || 0,
            price: Number(v.final_price) || 0,
            enabled: v.enabled,
            image_id: v.image_id ?? null,
            image_index: null,
            values: v.values ?? [],
        })),
    );
    const [localImages, setLocalImages] = useState<LocalImage[]>([]);
    const [libraryImages, setLibraryImages] = useState<ImageSelectorItem[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const markDirty = useCallback(() => {
        setIsDirty(prev => {
            if (!prev && process.env.NODE_ENV !== 'production') {
                console.log('[useProductForm] isDirty → true');
            }

            return true;
        });
    }, []);

    // Keep a ref to localImages for cleanup on unmount (avoids stale closure)
    const localImagesRef = useRef(localImages);

    useEffect(() => {
        localImagesRef.current = localImages;
    }, [localImages]);

    useEffect(() => {
        return () => {
            console.log('[useProductForm] cleanup: revoking blob URLs', localImagesRef.current.length);
            localImagesRef.current.forEach(img => URL.revokeObjectURL(img.url));
        };
    }, []);

    // ---------- Basic fields ----------

    const setTitle = useCallback((v: string) => {
        setTitleState(v);
        markDirty();
        setErrors(prev => {
            if (!prev.title) {return prev;}
            const next = {...prev};

            delete next.title;

            return next;
        });
    }, [markDirty]);

    const setDescription = useCallback((v: string) => {
        setDescriptionState(v);
        markDirty();
    }, [markDirty]);

    // ---------- Category & options ----------

    const selectCategory = useCallback((id: number) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('[useProductForm.selectCategory]', {id});
        }
        setCategoryId(id);
        setSelectedValues({});
        setVariants([]);
        markDirty();
        setErrors(prev => {
            const next = {...prev};

            delete next.category_id;

            return next;
        });
    }, [markDirty]);

    const toggleOptionValue = useCallback((optionId: number, valueId: number) => {
        setSelectedValues(prev => {
            const current = prev[optionId] ?? [];
            const isSelected = current.includes(valueId);
            const next = isSelected
                ? current.filter(v => v !== valueId)
                : [...current, valueId];

            if (process.env.NODE_ENV !== 'production') {
                console.log('[useProductForm.toggleOptionValue]', {optionId, valueId, isSelected, nextCount: next.length});
            }

            return {...prev, [optionId]: next};
        });
        // Reset variants when options change
        setVariants([]);
        markDirty();
    }, [markDirty]);

    const selectAllValues = useCallback((optionId: number, values: OptionValue[]) => {
        const ids = values.filter((v): v is OptionValue & {id: number} => v.id != null).map(v => v.id);

        if (process.env.NODE_ENV !== 'production') {
            console.log('[useProductForm.selectAllValues]', {optionId, count: ids.length});
        }

        setSelectedValues(prev => ({...prev, [optionId]: ids}));
        setVariants([]);
        markDirty();
    }, [markDirty]);

    const deselectAllValues = useCallback((optionId: number) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('[useProductForm.deselectAllValues]', {optionId});
        }

        setSelectedValues(prev => ({...prev, [optionId]: []}));
        setVariants([]);
        markDirty();
    }, [markDirty]);

    // ---------- Variant generation ----------

    const computeCombinationCount = useCallback(
        (category: CategoryWithOptions | null): number => {
            if (!category) {return 0;}

            const arrays = category.options
                .filter((opt): opt is typeof opt & {id: number} => opt.id != null)
                .map(opt => selectedValues[opt.id] ?? [])
                .filter(arr => arr.length > 0);

            if (arrays.length === 0) {return 0;}

            return arrays.reduce((acc, arr) => acc * arr.length, 1);
        },
        [selectedValues],
    );

    const generateVariants = useCallback(
        (category: CategoryWithOptions) => {
            const optionArrays = category.options
                .filter((opt): opt is typeof opt & {id: number} => opt.id != null && (selectedValues[opt.id] ?? []).length > 0)
                .map(opt => {
                    const ids = selectedValues[opt.id] ?? [];

                    return ids
                        .filter(valueId => opt.values.some(v => v.id === valueId))
                        .map(valueId => ({option_id: opt.id, option_value_id: valueId}));
                })
                .filter(arr => arr.length > 0);

            const combos = cartesian(optionArrays);
            const generated: LocalVariant[] = combos.map(combo => ({
                _key: generateKey(),
                values: combo,
                price: 0,
                comparePrice: 0,
                enabled: true,
                image_id: null,
                image_index: null,
                image_url: null,
            }));

            if (process.env.NODE_ENV !== 'production') {
                console.log('[useProductForm.generateVariants]', {
                    categoryId: category.id,
                    optionCount: optionArrays.length,
                    generatedCount: generated.length,
                });
            }

            setVariants(generated);
            markDirty();
            setErrors(prev => {
                const next = {...prev};

                delete next.variants;

                return next;
            });
        },
        [selectedValues, markDirty],
    );

    // ---------- Variant CRUD ----------

    const addVariant = useCallback(
        (values: {option_id: number; option_value_id: number}[]): string | null => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('[useProductForm.addVariant]', {values});
            }

            // Check for duplicate
            const comboKey = serializeCombo(values);
            const isDuplicate = variants.some(v => serializeCombo(v.values) === comboKey);

            if (isDuplicate) {
                return t('admin.products_edit.validation.duplicate_combination');
            }

            const newVariant: LocalVariant = {
                _key: generateKey(),
                values,
                price: 0,
                comparePrice: 0,
                enabled: true,
                image_id: null,
                image_index: null,
                image_url: null,
            };

            setVariants(prev => [...prev, newVariant]);
            markDirty();

            return null;
        },
        [variants, markDirty, t],
    );

    const updateVariant = useCallback(
        (key: string, patch: Partial<Omit<LocalVariant, '_key'>>) => {
            setVariants(prev =>
                prev.map(v => (v._key === key ? {...v, ...patch} : v)),
            );
            markDirty();
        },
        [markDirty],
    );

    const deleteVariant = useCallback((key: string) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('[useProductForm.deleteVariant]', {key});
        }

        setVariants(prev => prev.filter(v => v._key !== key));
        markDirty();
    }, [markDirty]);

    const applyBulkPricing = useCallback(
        (price: number | null, comparePrice: number | null) => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('[useProductForm.applyBulkPricing]', {price, comparePrice});
            }

            setVariants(prev =>
                prev.map(v => ({
                    ...v,
                    ...(price !== null && price > 0 ? {price} : {}),
                    ...(comparePrice !== null && comparePrice > 0 ? {comparePrice} : {}),
                })),
            );
            markDirty();
        },
        [markDirty],
    );

    // ---------- Local images (create mode) ----------

    const addLocalImages = useCallback((newImages: LocalImage[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('[useProductForm.addLocalImages]', {
                count: newImages.length,
                totalSize: newImages.reduce((s, img) => s + img.file.size, 0),
            });
        }

        setLocalImages(prev => [...prev, ...newImages]);
        markDirty();
    }, [markDirty]);

    const removeLocalImage = useCallback((uid: string) => {
        setLocalImages(prev => {
            const removed = prev.find(img => img.uid === uid);

            if (removed) {
                URL.revokeObjectURL(removed.url);
            }

            return prev.filter(img => img.uid !== uid);
        });
        markDirty();
    }, [markDirty]);

    const makeLocalImageFirst = useCallback((uid: string) => {
        setLocalImages(prev => {
            const idx = prev.findIndex(img => img.uid === uid);

            if (idx <= 0) {return prev;}

            const next = [...prev];
            const [item] = next.splice(idx, 1);

            next.unshift(item);

            return next;
        });
        markDirty();
    }, [markDirty]);

    // ---------- Library images (create mode — from media library) ----------

    const addLibraryImages = useCallback((images: ImageSelectorItem[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('[useProductForm] addLibraryImages', {count: images.length});
        }

        setLibraryImages(prev => {
            const existingUids = new Set(prev.map(img => img.uid));
            const newItems = images.filter(img => !existingUids.has(img.uid));

            return [...prev, ...newItems];
        });
        markDirty();
    }, [markDirty]);

    const removeLibraryImage = useCallback((uid: string) => {
        setLibraryImages(prev => {
            const removedIndex = prev.findIndex(img => img.uid === uid);

            if (removedIndex < 0) {return prev;}

            // Pickable ID of the removed image = localImages count + its index in libraryImages
            const removedPickableId = localImages.length + removedIndex;

            if (process.env.NODE_ENV !== 'production') {
                console.log('[useProductForm.removeLibraryImage]', {uid, removedIndex, removedPickableId});
            }

            // Fix variant image_index references that shift after removal
            setVariants(prevVariants =>
                prevVariants.map(v => {
                    if (v.image_index === null) {return v;}

                    if (v.image_index === removedPickableId) {
                        return {...v, image_index: null, image_url: null};
                    }

                    if (v.image_index > removedPickableId) {
                        return {...v, image_index: v.image_index - 1};
                    }

                    return v;
                }),
            );

            return prev.filter(img => img.uid !== uid);
        });
        markDirty();
    }, [markDirty, localImages.length]);

    const clearLibraryImages = useCallback(() => {
        setLibraryImages([]);
    }, []);

    // ---------- Reset ----------

    const resetForm = useCallback(() => {
        const data = initialDataRef.current;

        if (process.env.NODE_ENV !== 'production') {
            console.log('[useProductForm] resetForm called', {
                title: data.title,
                variantCount: data.variantsData.length,
            });
        }

        setTitleState(data.title);
        setDescriptionState(data.description);
        setCategoryId(data.categoryId);
        setSelectedValues(data.selectedValues);
        setVariants(data.variantsData.map(v => ({
            _key: generateKey(),
            image_index: null,
            image_url: null,
            ...v,
        })));
        setLocalImages([]);
        setLibraryImages([]);
        setIsDirty(false);
        setErrors({});
    }, []);

    // ---------- Validation ----------

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = t('admin.products_edit.validation.title_required');
        }

        if (!categoryId) {
            newErrors.category_id = t('admin.products_edit.validation.category_required');
        }

        const activeVariants = variants.filter(v => v.enabled);

        if (activeVariants.length === 0) {
            newErrors.variants = t('admin.products_edit.validation.at_least_one_active_variant');
        } else {
            const hasNoPrice = activeVariants.some(v => v.price <= 0);

            if (hasNoPrice) {
                newErrors.variants = t('admin.products_edit.validation.all_variants_need_price');
            } else {
                const hasInvalidCompare = activeVariants.some(
                    v => v.comparePrice > 0 && v.comparePrice <= v.price,
                );

                if (hasInvalidCompare) {
                    newErrors.variants = t('admin.products_edit.validation.compare_price_must_be_higher');
                }
            }
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log('[useProductForm.validate]', {
                passed: Object.keys(newErrors).length === 0,
                errors: newErrors,
            });
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }, [title, categoryId, variants, t]);

    const clearError = useCallback((field: string) => {
        setErrors(prev => {
            if (!prev[field]) {return prev;}

            const {[field]: _, ...rest} = prev;

            return rest;
        });
    }, []);

    // ---------- Submit payload ----------

    const buildSubmitPayload = useCallback(
        (isEdit: boolean): Record<string, unknown> => {
            const payload: Record<string, unknown> = {
                title,
                description,
                enabled: variants.some(v => v.enabled),
                category_id: categoryId,
                variants: variants.map(v => ({
                    ...(v.id ? {id: v.id} : {}),
                    title: '',
                    // DB price = original/compare; DB final_price = current selling
                    price: v.comparePrice,
                    final_price: v.price,
                    enabled: v.enabled,
                    image_id: isEdit ? v.image_id : null,
                    image_index: !isEdit ? v.image_index : null,
                    values: v.values,
                })),
            };

            if (!isEdit) {
                const imageOrder: string[] = [];

                if (localImages.length > 0) {
                    payload['images'] = localImages.map(img => img.file);
                    localImages.forEach((_, i) => imageOrder.push(`upload:${i}`));
                }

                if (libraryImages.length > 0) {
                    payload['existing_image_ids'] = libraryImages.map(img => Number(img.uid));
                    libraryImages.forEach((_, i) => imageOrder.push(`existing:${i}`));
                }

                if (imageOrder.length > 0) {
                    payload['image_order'] = imageOrder;
                }
            }

            if (process.env.NODE_ENV !== 'production') {
                console.log('[useProductForm.buildSubmitPayload]', {
                    isEdit,
                    variantCount: variants.length,
                    localImageCount: localImages.length,
                    libraryImageCount: libraryImages.length,
                });
            }

            return payload;
        },
        [title, description, categoryId, variants, localImages, libraryImages],
    );

    return {
        title,
        description,
        categoryId,
        selectedValues,
        variants,
        localImages,
        libraryImages,
        isDirty,
        errors,
        setTitle,
        setDescription,
        selectCategory,
        toggleOptionValue,
        selectAllValues,
        deselectAllValues,
        generateVariants,
        computeCombinationCount,
        addVariant,
        updateVariant,
        deleteVariant,
        applyBulkPricing,
        addLocalImages,
        removeLocalImage,
        makeLocalImageFirst,
        addLibraryImages,
        removeLibraryImage,
        clearLibraryImages,
        resetForm,
        validate,
        clearError,
        buildSubmitPayload,
    };
}
