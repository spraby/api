import {useMemo} from "react";
import {Option, OptionValue, ProductImage, Variant} from "@/types/data";
import {VariantLine} from "@/components/variant-line.tsx";
import {PlusIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {v4 as uuidv4} from 'uuid';

interface CombinationItem {
    optionId: number;
    optionValue: OptionValue;
}

const createVariant = (combination: CombinationItem[], options: Option[]): Variant => {
    const optionOrder = new Map(options.map((o, i) => [o.id, i]));
    return {
        uid: uuidv4(),
        title: combination
            .slice()
            .sort((a, b) => (optionOrder.get(a.optionId) ?? 0) - (optionOrder.get(b.optionId) ?? 0))
            .map(c => c.optionValue.value)
            .join(' / '),
        price: 0,
        final_price: 0,
        enabled: true,
        values: combination.map(c => ({
            uid: uuidv4(),
            option_id: c.optionId,
            option_value_id: c.optionValue.id ?? undefined,
            value: {
                uid: c.optionValue.uid,
                id: c.optionValue.id ?? undefined,
                value: c.optionValue.value,
                position: c.optionValue.position,
            },
        })),
    };
}

export const VariantList = ({variants, images = [], options = [], onChange}: {
    variants: Variant[],
    images: ProductImage[],
    options: Option[],
    onChange: (variants: Variant[]) => void
}) => {

    const onChangeHandle = (variant: Variant) => {
        onChange(variants.map(v => variant.uid === v.uid ? variant : v))
    }

    const onDeleteHandle = (uid: string) => {
        onChange(variants.filter(v => v.uid !== uid))
    }

    const onAddVariant = () => {
        const combination = findFreeCombination(variants, options);
        if (!combination) return;
        onChange([...variants, createVariant(combination, options)]);
    }

    const hasFreeCombination = useMemo(
        () => options.some(o => o.values?.length) && findFreeCombination(variants, options) !== null,
        [variants, options]
    );

    return <>
        <div className={'flex flex-col gap-2 md:grid md:grid-cols-[90px_1fr_auto_auto] md:gap-x-4 md:gap-y-2'}>
            {variants.map(variant =>
                <VariantLine key={variant.uid} variant={variant} images={images} options={options} onChange={onChangeHandle} onDelete={() => onDeleteHandle(variant.uid)}/>
            )}
        </div>

        {hasFreeCombination && (
            <div className={'flex justify-end'}>
                <Button
                    type="button"
                    variant="outline"
                    className="border-dashed"
                    onClick={onAddVariant}
                >
                    <PlusIcon className="w-4 h-4 mr-2"/>
                    Add variant
                </Button>
            </div>

        )}
    </>
}

/**
 * Находит первую свободную комбинацию значений опций, не использованную существующими вариантами.
 * Перебирает комбинации лениво — возвращает первую найденную без генерации всех возможных.
 */
function findFreeCombination(variants: Variant[], options: Option[]): CombinationItem[] | null {
    const optionsWithValues = options.filter(o => o.id != null && o.values && o.values.length > 0) as (Option & { id: number; values: OptionValue[] })[];
    if (!optionsWithValues.length) return null;

    // Собираем ключи использованных комбинаций
    const usedKeys = new Set(
        variants.map(v => {
            return optionsWithValues.map(o => {
                const vv = v.values?.find(val => val.option_id === o.id);
                return vv?.option_value_id ?? '';
            }).join(':');
        })
    );

    // Ленивый перебор декартова произведения
    const valueSets: OptionValue[][] = optionsWithValues.map(o => o.values);
    const indices: number[] = new Array(valueSets.length).fill(0);

    for (;;) {
        const key = indices.map((idx, i) => valueSets[i]![idx]!.id ?? '').join(':');

        if (!usedKeys.has(key)) {
            return indices.map((idx, i): CombinationItem => ({
                optionId: optionsWithValues[i]!.id,
                optionValue: valueSets[i]![idx]!,
            }));
        }

        // Инкремент индексов (как счётчик с переносом)
        let carry = true;
        for (let i = indices.length - 1; i >= 0 && carry; i--) {
            indices[i]!++;
            if (indices[i]! < valueSets[i]!.length) {
                carry = false;
            } else {
                indices[i] = 0;
            }
        }

        if (carry) return null;
    }
}
