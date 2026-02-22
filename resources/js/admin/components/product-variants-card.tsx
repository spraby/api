import {useMemo} from 'react';

import {PlusIcon} from 'lucide-react';

import {DuplicateVariantsAlert} from '@/components/duplicate-variants-alert';
import type {ImageSelectorItem} from '@/components/image-selector';
import {ProductVariantItem} from '@/components/product-variant-item';
import type {VariantFormItem} from '@/components/product-variant-item';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import type {PickableImage} from '@/components/variant-image-picker-dialog';
import {useLang} from '@/lib/lang';
import type {Option, ProductImage} from '@/types/models';

interface ProductVariantsCardProps {
    variants: VariantFormItem[];
    options: Option[];
    productImages: ProductImage[];
    stagedItems: ImageSelectorItem[];
    isEdit: boolean;
    disabled?: boolean;
    onChange: (variants: VariantFormItem[]) => void;
}

function serializeCombo(values: {option_id: number; option_value_id: number}[]): string {
    return [...values]
        .sort((a, b) => a.option_id - b.option_id)
        .map(v => `${v.option_id}:${v.option_value_id}`)
        .join(',');
}

function nextVariantCombo(
    existingVariants: VariantFormItem[],
    options: Option[],
): {option_id: number; option_value_id: number}[] {
    if (options.length === 0) {
        return [];
    }

    const usedCombos = new Set(existingVariants.map(v => serializeCombo(v.values)));

    const optionChoices = options
        .filter((o): o is Option & {id: number} => !!o.id)
        .map(o => (o.values ?? [])
            .filter((v): v is typeof v & {id: number} => !!v.id)
            .map(v => ({option_id: o.id, option_value_id: v.id}))
        );

    if (optionChoices.some(choices => choices.length === 0)) {
        return optionChoices.map(choices => choices[0]).filter(Boolean);
    }

    function cartesian(
        idx: number,
        current: {option_id: number; option_value_id: number}[],
    ): {option_id: number; option_value_id: number}[] | null {
        if (idx === optionChoices.length) {
            return usedCombos.has(serializeCombo(current)) ? null : current;
        }

        for (const choice of optionChoices[idx]) {
            const result = cartesian(idx + 1, [...current, choice]);

            if (result !== null) {
                return result;
            }
        }

        return null;
    }

    return cartesian(0, []) ?? optionChoices.map(choices => choices[0]);
}

function findDuplicateGroups(variants: VariantFormItem[]): number[][] {
    const groups = new Map<string, number[]>();

    variants.forEach((v, i) => {
        const key = serializeCombo(v.values);
        const existing = groups.get(key);

        if (existing !== undefined) {
            existing.push(i);
        } else {
            groups.set(key, [i]);
        }
    });

    return [...groups.values()].filter(g => g.length > 1);
}

export function ProductVariantsCard({
    variants,
    options,
    productImages,
    stagedItems,
    isEdit,
    disabled,
    onChange,
}: ProductVariantsCardProps) {
    const {t} = useLang();

    const pickableImages = useMemo<PickableImage[]>(() => {
        if (isEdit) {
            return productImages
                .filter((pi): pi is ProductImage & {id: number} => pi.id !== undefined)
                .map(pi => ({
                    id: pi.id,
                    url: pi.image?.url,
                    alt: pi.image?.alt,
                    name: pi.image?.name,
                }));
        }

        return stagedItems.map((item, i) => ({
            id: i,
            url: item.url,
            alt: item.alt,
            name: item.name,
        }));
    }, [isEdit, productImages, stagedItems]);

    const duplicateGroups = useMemo(() => findDuplicateGroups(variants), [variants]);

    const handleAdd = () => {
        const values = nextVariantCombo(variants, options);
        const newVariant: VariantFormItem = {
            title: '',
            price: 0,
            final_price: 0,
            enabled: true,
            image_id: null,
            image_index: null,
            values,
        };

        onChange([...variants, newVariant]);
    };

    const handleChange = (index: number, variant: VariantFormItem) => {
        const next = [...variants];

        next[index] = variant;
        onChange(next);
    };

    const handleDelete = (index: number) => {
        if (variants.length <= 1) {
            return;
        }

        onChange(variants.filter((_, i) => i !== index));
    };

    return (
        <Card className="flex flex-col gap-3 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <Label>{t('admin.products_edit.sections.variants')}</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={handleAdd}
                >
                    <PlusIcon className="size-4"/>
                    {t('admin.products_edit.actions.add_variant')}
                </Button>
            </div>
            <DuplicateVariantsAlert duplicateGroups={duplicateGroups}/>
            <div className="flex flex-col gap-3">
                {variants.map((variant, index) => (
                    <ProductVariantItem
                        key={variant.id ?? `new-${index}`}
                        variant={variant}
                        index={index}
                        options={options}
                        pickableImages={pickableImages}
                        isEdit={isEdit}
                        disabled={disabled}
                        onChange={v => handleChange(index, v)}
                        onDelete={() => handleDelete(index)}
                    />
                ))}
            </div>
        </Card>
    );
}
