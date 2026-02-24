import {useMemo, useState} from 'react';

import {PlusIcon} from 'lucide-react';

import {StepHeader} from '@/components/step-header';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import type {PickableImage} from '@/components/variant-image-picker-dialog';
import {VariantRow} from '@/components/variant-row';
import type {LocalVariant} from '@/hooks/use-product-form';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import type {Option, OptionValue} from '@/types/models';

interface Props {
    variants: LocalVariant[];
    options: (Option & {values: OptionValue[]})[];
    categoryId: number | null;
    variantErrors: string[];
    pickableImages?: PickableImage[];
    productId?: number;
    isEdit?: boolean;
    onNewImageAttached?: (img: PickableImage) => void;
    onUpdate: (key: string, patch: Partial<LocalVariant>) => void;
    onDelete: (key: string) => void;
    onAdd: (values: {option_id: number; option_value_id: number}[]) => string | null;
    onBulkPricing: (price: number | null, comparePrice: number | null) => void;
}

type FilledOption = Option & {id: number; values: OptionValue[]};

function serializeCombo(values: {option_id: number; option_value_id: number}[]): string {
    return [...values]
        .sort((a, b) => a.option_id - b.option_id)
        .map(v => `${v.option_id}:${v.option_value_id}`)
        .join(',');
}

export function ProductVariantsCard({
    variants,
    options,
    categoryId,
    variantErrors,
    pickableImages,
    productId,
    isEdit,
    onNewImageAttached,
    onUpdate,
    onDelete,
    onAdd,
    onBulkPricing,
}: Props) {
    const {t} = useLang();
    const [showAddForm, setShowAddForm] = useState(false);
    const [addFormValues, setAddFormValues] = useState<Record<number, number>>({});
    const [addFormError, setAddFormError] = useState<string | null>(null);
    const [bulkPrice, setBulkPrice] = useState('');
    const [bulkCompare, setBulkCompare] = useState('');

    const handleChipClick = (optionId: number, valueId: number) => {
        setAddFormValues(prev => ({...prev, [optionId]: valueId}));
        setAddFormError(null);
    };

    const handleAddSubmit = () => {
        const missing: string[] = [];

        for (const option of options) {
            if (option.id == null) {
                continue;
            }

            if (addFormValues[option.id] == null) {
                missing.push(option.title || option.name);
            }
        }

        if (missing.length > 0) {
            setAddFormError(`${t('admin.products_edit.select_value_for')} ${missing.join(', ')}`);

            return;
        }

        const values = Object.entries(addFormValues).map(([optionId, valueId]) => ({
            option_id: Number(optionId),
            option_value_id: valueId,
        }));

        const error = onAdd(values);

        if (error) {
            setAddFormError(error);

            return;
        }

        setShowAddForm(false);
        setAddFormValues({});
        setAddFormError(null);
    };

    const handleAddCancel = () => {
        setShowAddForm(false);
        setAddFormValues({});
        setAddFormError(null);
    };

    const handleBulkApply = () => {
        const price = bulkPrice.trim() ? parseFloat(bulkPrice) : null;
        const comparePrice = bulkCompare.trim() ? parseFloat(bulkCompare) : null;

        onBulkPricing(price, comparePrice);
    };

    const filledOptions = options.filter((o): o is FilledOption => o.id != null);

    // Compute preview combo key for duplicate detection
    const previewValues = Object.entries(addFormValues).map(([optionId, valueId]) => ({
        option_id: Number(optionId),
        option_value_id: valueId,
    }));

    const previewComboKey = previewValues.length > 0 ? serializeCombo(previewValues) : '';

    const existingCombos = useMemo(
        () => new Set(variants.map(v => serializeCombo(v.values))),
        [variants],
    );
    const allOptionsSelected = Object.keys(addFormValues).length === filledOptions.length;
    const isDuplicate = previewComboKey.length > 0
        && allOptionsSelected
        && existingCombos.has(previewComboKey);

    // Build preview label for the add form
    const previewLabel = filledOptions
        .map(o => {
            const selectedValueId = addFormValues[o.id];

            if (selectedValueId == null) {
                return null;
            }

            const val = o.values.find(v => v.id === selectedValueId);

            return val ? val.value : null;
        })
        .filter(Boolean)
        .join(' / ');

    const emptyStateMessage = (() => {
        if (categoryId === null) {
            return t('admin.products_edit.select_category_variants');
        }

        if (options.length === 0) {
            return t('admin.products_edit.no_options_message');
        }

        return t('admin.products_edit.no_variants_message');
    })();

    return (
        <Card className="flex flex-col gap-4 p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                    <StepHeader step={3} label={t('admin.products_edit.sections.variants')} />
                </div>
                {!showAddForm && categoryId !== null && options.length > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddForm(true)}
                    >
                        <PlusIcon className="size-4" />
                        {t('admin.products_edit.actions.add_variant')}
                    </Button>
                )}
            </div>

            {/* Inline add form */}
            {showAddForm ? (
                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                    <p className="mb-3 text-sm font-medium text-primary">
                        {t('admin.products_edit.new_variant_header')}
                    </p>

                    {/* Per-option single-select chips */}
                    <div className="flex flex-col gap-3">
                        {filledOptions.map(option => {
                            const {id: optionId} = option;
                            const selectedValueId = addFormValues[optionId];

                            return (
                                <div key={optionId} className="flex flex-col gap-1.5">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {option.title || option.name}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {option.values.map(val => {
                                            if (val.id == null) {
                                                return null;
                                            }

                                            const valId = val.id;
                                            const isSelected = selectedValueId === valId;

                                            return (
                                                <button
                                                    key={valId}
                                                    type="button"
                                                    onClick={() => handleChipClick(optionId, valId)}
                                                    className={cn(
                                                        'rounded-md border px-2.5 py-1 text-xs transition-colors',
                                                        isSelected
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border text-muted-foreground hover:border-primary/40',
                                                    )}
                                                >
                                                    {val.value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Live preview */}
                    {previewLabel ? (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{t('admin.products_edit.preview_label')}</span>
                            <span
                                className={cn(
                                    'rounded border px-2 py-0.5 text-xs font-medium',
                                    isDuplicate
                                        ? 'border-destructive/50 bg-destructive/10 text-destructive'
                                        : 'border-primary/30 bg-primary/10 text-primary',
                                )}
                            >
                                {isDuplicate ? `${previewLabel}${t('admin.products_edit.duplicate_label')}` : previewLabel}
                            </span>
                        </div>
                    ) : null}

                    {/* Error */}
                    {addFormError ? (
                        <p className="mt-2 text-xs text-destructive">{addFormError}</p>
                    ) : null}

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleAddSubmit}
                            disabled={isDuplicate}
                        >
                            {t('admin.products_edit.add_btn')}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddCancel}
                        >
                            {t('admin.products_edit.actions.cancel')}
                        </Button>
                    </div>
                </div>
            ) : null}

            {/* Bulk pricing block */}
            {variants.length > 0 ? (
                <div className="rounded-xl bg-muted/50 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t('admin.products_edit.bulk_pricing_header')}
                    </p>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="bulk-price"
                                className="text-xs text-muted-foreground"
                            >
                                {t('admin.products_edit.sale_price_label')}
                            </label>
                            <div className="flex items-center overflow-hidden rounded-lg border border-input bg-background text-sm">
                                <span className="px-2 py-1.5 text-xs text-muted-foreground">₽</span>
                                <input
                                    id="bulk-price"
                                    type="number"
                                    min={0}
                                    placeholder={t('admin.products_edit.price_ph')}
                                    value={bulkPrice}
                                    onChange={e => setBulkPrice(e.target.value)}
                                    className="w-24 bg-transparent py-1.5 pr-2 text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="bulk-compare"
                                className="text-xs text-muted-foreground"
                            >
                                {t('admin.products_edit.compare_price_label')}
                            </label>
                            <div className="flex items-center overflow-hidden rounded-lg border border-input bg-background text-sm">
                                <span className="px-2 py-1.5 text-xs text-muted-foreground">₽</span>
                                <input
                                    id="bulk-compare"
                                    type="number"
                                    min={0}
                                    placeholder={t('admin.products_edit.old_price_ph')}
                                    value={bulkCompare}
                                    onChange={e => setBulkCompare(e.target.value)}
                                    className="w-24 bg-transparent py-1.5 pr-2 text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={!bulkPrice && !bulkCompare}
                            onClick={handleBulkApply}
                        >
                            {t('admin.products_edit.apply_to_all')}
                        </Button>
                    </div>
                </div>
            ) : null}

            {/* Variants table */}
            {variants.length > 0 ? (
                <div className="divide-y divide-border rounded-xl border border-border">
                    {variants.map((variant, index) => (
                        <VariantRow
                            key={variant._key}
                            variant={variant}
                            displayIndex={index + 1}
                            options={options}
                            pickableImages={pickableImages}
                            productId={productId}
                            isEdit={isEdit}
                            onNewImageAttached={onNewImageAttached}
                            onUpdate={patch => onUpdate(variant._key, patch)}
                            onDelete={() => onDelete(variant._key)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                        {emptyStateMessage}
                    </p>
                </div>
            )}

            {/* Variant errors */}
            {variantErrors.length > 0 ? (
                <div className="flex flex-col gap-1">
                    {variantErrors.map((err, i) => (
                        <p key={i} className="text-xs text-destructive">
                            {err}
                        </p>
                    ))}
                </div>
            ) : null}
        </Card>
    );
}
