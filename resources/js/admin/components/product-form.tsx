/**
 * Variant Option Selector Component
 *
 * Allows selecting option values for a product variant based on category options
 */
import {type FormEventHandler, useEffect, useMemo, useRef, useState} from "react";

import {useForm, router} from '@inertiajs/react';
import {XIcon} from 'lucide-react';
import {toast} from "sonner";

import {ProductImagesManager} from "@/components/product-images-manager.tsx";
import {ProductVariantList} from "@/components/product-variant-list.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {RichTextEditor} from '@/components/ui/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {useLang} from '@/lib/lang';
import {VariantService} from '@/services/variant-service';
import type {Product} from "@/types/models.ts";
import type {PendingVisit} from "@inertiajs/core";


export function ProductForm({product: defaultProduct}: { product: Product }) {
    const {t} = useLang();

    const {data: product, setData, setDefaults, errors, put, post, processing, isDirty} = useForm(defaultProduct);
    const isEditMode = useMemo(() => !!product?.id, [product?.id]);
    const brandCategories = useMemo(() => defaultProduct?.brand?.categories ?? [], [defaultProduct?.brand?.categories]);
    const category = useMemo(() => {
        if (!brandCategories?.length) {return null;}
        if (product?.category_id) {
            return brandCategories.find(i => i.id === product.category_id);
        }

        return brandCategories[0]
    }, [product, brandCategories])

    // Check for duplicate variants
    const hasDuplicateVariants = useMemo(() => {
        const duplicateGroups = VariantService.findDuplicateGroups(product.variants ?? []);

        return duplicateGroups.length > 0;
    }, [product.variants]);

    const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
    const pendingVisitRef = useRef<PendingVisit | null>(null);
    const shouldNavigateAfterSaveRef = useRef(false);
    const ignoreNextVisitRef = useRef(false);
    const isDirtyRef = useRef(isDirty);
    const dialogDismissReasonRef = useRef<'save' | 'discard' | null>(null);

    // Track if variant values have been initialized to prevent overwriting user changes
    const variantsInitialized = useRef(false);

    useEffect(() => {
        isDirtyRef.current = isDirty;
    }, [isDirty]);

    useEffect(() => {
        const removeListener = router.on('before', (event) => {
            if (ignoreNextVisitRef.current) {
                ignoreNextVisitRef.current = false;

                return;
            }

            const {visit} = event.detail;

            if (visit.prefetch) {
                return;
            }

            if (!isDirtyRef.current) {
                return;
            }

            if ((visit.method ?? 'get').toLowerCase() !== 'get') {
                return;
            }

            event.preventDefault();
            pendingVisitRef.current = visit;
            setUnsavedDialogOpen(true);
        });

        return () => {
            removeListener();
        };
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!isDirtyRef.current) {
                return;
            }

            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (!product?.category_id && !!category?.id) {setData('category_id', category?.id);}
    }, [product, category, setData]);

    // Auto-generate variant values ONLY on initial load (not on every change)
    useEffect(() => {
        // Skip if already initialized or no data
        if (variantsInitialized.current || !category?.options?.length || !product?.variants?.length) {
            return;
        }

        let hasChanges = false;

        const updatedVariants = product.variants.map((variant, index) => {
            // Skip variants that already have an ID (existing variants)
            if (variant?.id) {
                return variant;
            }

            // Skip variants that already have values (user might have set them)
            if (variant.values && variant.values.length > 0) {
                return variant;
            }

            // Get all other variants (excluding current one being processed)
            const otherVariants = (product.variants ?? []).filter((_, i) => i !== index);

            // Generate first unique combination for this variant
            const generatedValues = VariantService.generateVariantValues(
                category.options ?? [],
                otherVariants
            );

            // If no available combinations, keep variant as is
            if (!generatedValues) {
                return variant;
            }

            hasChanges = true;

            return { ...variant, values: generatedValues };
        });

        if (hasChanges) {
            setData('variants', updatedVariants);
            variantsInitialized.current = true; // Mark as initialized
        }
    }, [category, product.variants, setData]);

    /**
     * Handle form submission with duplicate validation
     */
    const submitForm = (navigateAfterSave = false) => {
        // Prevent saving if there are duplicate variants
        if (hasDuplicateVariants) {
            toast.error(t('admin.products_edit.errors.duplicate_variants'));

            return;
        }

        if (navigateAfterSave) {
            shouldNavigateAfterSaveRef.current = true;
        }

        const handleSuccess = (page: { props: Record<string, unknown> }) => {
            const nextProduct = page.props['product'] as Product | undefined;

            if (nextProduct) {
                setData(nextProduct);
                setDefaults(nextProduct);
            }

            if (shouldNavigateAfterSaveRef.current && pendingVisitRef.current) {
                const visit = pendingVisitRef.current;

                pendingVisitRef.current = null;
                shouldNavigateAfterSaveRef.current = false;

                const {url, completed, cancelled, interrupted, ...options} = visit;

                ignoreNextVisitRef.current = true;
                router.visit(url, options);

                return;
            }

            shouldNavigateAfterSaveRef.current = false;
        };

        const handleError = () => {
            shouldNavigateAfterSaveRef.current = false;
            pendingVisitRef.current = null;
        };

        ignoreNextVisitRef.current = true;
        if (product?.id) {
            put(route('admin.products.update', product.id), {
                preserveScroll: true,
                onSuccess: handleSuccess,
                onError: handleError,
            });
        } else {
            post(route('admin.products.store'), {
                onSuccess: handleSuccess,
                onError: handleError,
            });
        }
    }

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        submitForm(false);
    };

    const handleStayEditing = () => {
        dialogDismissReasonRef.current = null;
        pendingVisitRef.current = null;
        shouldNavigateAfterSaveRef.current = false;
        setUnsavedDialogOpen(false);
    };

    const handleDiscardChanges = () => {
        dialogDismissReasonRef.current = 'discard';
        const visit = pendingVisitRef.current;

        pendingVisitRef.current = null;
        shouldNavigateAfterSaveRef.current = false;
        setUnsavedDialogOpen(false);

        if (!visit) {
            return;
        }

        const {url, completed, cancelled, interrupted, ...options} = visit;

        ignoreNextVisitRef.current = true;
        router.visit(url, options);
    };

    const handleSaveAndLeave = () => {
        dialogDismissReasonRef.current = 'save';
        setUnsavedDialogOpen(false);
        submitForm(true);
    };

    return <>
        <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
                <div className="col-span-1 md:col-span-9">
                    <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
                        <div className="col-span-12 gap-2 flex flex-col">
                            <Label className="flex items-center gap-1" htmlFor="title">
                                {t('admin.products_edit.fields.title')}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                required
                                id="title"
                                placeholder={t('admin.products_edit.placeholders.title')}
                                type="text"
                                value={product.title}
                                onChange={e => setData('title', e.target.value)}
                                className={errors.title ? 'border-destructive' : ''}
                            />
                            {!!errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                        </div>
                        <div className="col-span-12 gap-2 flex flex-col">
                            <Label
                                htmlFor="description">{t('admin.products_edit.fields.description')}</Label>
                            <RichTextEditor
                                placeholder={t('admin.products_edit.placeholders.description')}
                                value={product.description ?? ''}
                                onChange={v => setData('description', v)}
                            />
                            {!!errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                        </div>
                    </Card>
                </div>

                <div className="col-span-1 md:col-span-3">
                    <Card className="flex flex-col gap-4 md:gap-5 rounded-lg border bg-card p-4 sm:p-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={product.enabled}
                                    id="enabled"
                                    onCheckedChange={v => setData('enabled', v as boolean)}
                                />
                                <Label className="cursor-pointer" htmlFor="enabled">
                                    {t('admin.products_edit.fields.enabled')}
                                </Label>
                            </div>
                            {!!errors.enabled && <p className="text-xs text-destructive">{errors.enabled}</p>}
                        </div>
                        {
                            category?.id ?
                                <div className="gap-2 flex flex-col">
                                    <Label htmlFor="category">{t('admin.products_edit.fields.category')}</Label>
                                    <Select
                                        disabled={isEditMode}
                                        value={category.id.toString()}
                                        onValueChange={(value) => {
                                            if (!value?.length) {
                                                return;
                                            }
                                            setData('category_id', Number(value));
                                        }}
                                    >
                                        <SelectTrigger
                                            id="category"
                                            className={errors.category_id ? 'border-destructive' : ''}
                                        >
                                            <SelectValue placeholder={t('admin.products_edit.placeholders.category')}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brandCategories.map((category) => (
                                                category?.id ?
                                                    <SelectItem key={category.id} value={category?.id.toString()}>
                                                        {category.name}
                                                    </SelectItem> : null
                                            ))}
                                        </SelectContent>
                                    </Select>


                                    {!!errors.category_id &&
                                        <p className="text-xs text-destructive">{errors.category_id}</p>}
                                    {!isEditMode && (
                                        <p className="text-xs text-muted-foreground">
                                            {t('admin.products_edit.category.locked')}
                                        </p>
                                    )}

                                </div> :
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {t('admin.products_edit.category.not_in_list')}
                                    </AlertDescription>
                                </Alert>
                        }
                    </Card>
                </div>

                {
                    !!product?.id &&
                    <Card className="col-span-9 p-4 sm:p-6">
                        <ProductImagesManager
                            disabled={processing}
                            images={product.images || []}
                            productId={product?.id}
                        />
                    </Card>
                }
                {
                    (!!product?.variants?.length) && <ProductVariantList
                        product={product}
                        onUpdate={v => {
                            setData('variants', [...v])
                        }}
                        options={category?.options ?? []}
                    />
                }

            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                    <span className="text-destructive">*</span> {t('admin.products_edit.required_fields')}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={processing}
                        className="w-full sm:w-auto"
                        onClick={() => {
                        router.visit(route('admin.products'));
                        }}
                    >
                        {t('admin.products_edit.actions.cancel')}
                    </Button>
                    <Button type="submit" disabled={processing || hasDuplicateVariants} className="w-full sm:w-auto">
                        {processing
                            ? t('admin.products_edit.actions.saving')
                            : t('admin.products_edit.actions.save')}
                    </Button>
                </div>
            </div>
        </form>

        <AlertDialog open={unsavedDialogOpen} onOpenChange={(open) => {
            if (open) {
                setUnsavedDialogOpen(true);

                return;
            }

            if (dialogDismissReasonRef.current) {
                dialogDismissReasonRef.current = null;
                setUnsavedDialogOpen(false);

                return;
            }

            handleStayEditing();
        }}>
            <AlertDialogContent>
                <AlertDialogHeader className="relative">
                    <AlertDialogTitle>{t('admin.products_edit.unsaved_changes.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('admin.products_edit.unsaved_changes.description')}
                    </AlertDialogDescription>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleStayEditing}
                        aria-label={t('admin.products_edit.unsaved_changes.actions.stay')}
                    >
                        <XIcon className="size-4"/>
                    </Button>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        type="button"
                        onClick={handleStayEditing}
                    >
                        {t('admin.products_edit.unsaved_changes.actions.stay')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        type="button"
                        className={buttonVariants({variant: "destructive"})}
                        onClick={handleDiscardChanges}
                    >
                        {t('admin.products_edit.unsaved_changes.actions.discard')}
                    </AlertDialogAction>
                    <AlertDialogAction
                        type="button"
                        disabled={processing}
                        onClick={handleSaveAndLeave}
                    >
                        {processing
                            ? t('admin.common.saving')
                            : t('admin.products_edit.unsaved_changes.actions.save')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>;
}
