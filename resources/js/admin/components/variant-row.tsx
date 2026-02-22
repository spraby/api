import {useState} from 'react';

import {CheckIcon, TrashIcon, XIcon} from 'lucide-react';

import type {LocalVariant} from '@/hooks/use-product-form';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import type {Option, OptionValue} from '@/types/models';

interface VariantRowProps {
    variant: LocalVariant;
    displayIndex: number;
    options: (Option & {values: OptionValue[]})[];
    onUpdate: (patch: Partial<LocalVariant>) => void;
    onDelete: () => void;
}

function formatDiscount(price: number, comparePrice: number): string | null {
    if (comparePrice > price && price > 0) {
        const pct = Math.round(((comparePrice - price) / comparePrice) * 100);

        return `-${pct}%`;
    }

    return null;
}

/** Find option and value objects for a variant value entry */
function resolveValue(
    optionId: number,
    optionValueId: number,
    options: (Option & {values: OptionValue[]})[],
): {option: Option; value: OptionValue} | null {
    const option = options.find(o => o.id === optionId);

    if (!option) {return null;}
    const value = option.values.find(v => v.id === optionValueId);

    if (!value) {return null;}

    return {option, value};
}

function isHexColor(s: string): boolean {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
}

function isColorOption(option: Option): boolean {
    const name = option.name.toLowerCase();

    return name === 'color' || name === 'colour' || name === 'цвет';
}

export function VariantRow({variant, displayIndex, options, onUpdate, onDelete}: VariantRowProps) {
    const {t} = useLang();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const discount = formatDiscount(variant.price, variant.comparePrice);
    const isDisabled = !variant.enabled;

    const handlePriceChange = (field: 'price' | 'comparePrice', raw: string) => {
        const val = parseFloat(raw);

        onUpdate({[field]: isNaN(val) ? 0 : val});
    };

    return (
        <div className="relative">
            {/* Main row */}
            <div
                className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted/40',
                    isDisabled && 'opacity-35',
                )}
            >
                {/* Display number */}
                <span className="w-6 shrink-0 font-mono text-[11px] text-muted-foreground">
                    #{displayIndex}
                </span>

                {/* Value badges */}
                <div className="flex flex-1 flex-wrap items-center gap-1">
                    {variant.values.map(({option_id: optionId, option_value_id: optionValueId}) => {
                        const resolved = resolveValue(optionId, optionValueId, options);

                        if (!resolved) {return null;}
                        const {option, value} = resolved;
                        const showDot = isColorOption(option) && isHexColor(value.value);

                        return (
                            <span
                                key={`${optionId}:${optionValueId}`}
                                className="flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[11px]"
                            >
                                {showDot ? (
                                    <span
                                        className="size-[7px] shrink-0 rounded-full"
                                        style={{backgroundColor: value.value}}
                                    />
                                ) : null}
                                {value.value}
                            </span>
                        );
                    })}
                </div>

                {/* Price input */}
                <div
                    role="presentation"
                    className={cn(
                        'flex items-center overflow-hidden rounded-lg border border-input bg-background text-sm',
                        isDisabled && 'pointer-events-none',
                    )}
                    onClick={e => e.stopPropagation()}
                >
                    <span className="px-2 py-1.5 text-xs text-muted-foreground">₽</span>
                    <input
                        type="number"
                        min={0}
                        placeholder={t('admin.products_edit.price_ph')}
                        value={variant.price || ''}
                        onChange={e => handlePriceChange('price', e.target.value)}
                        className="w-20 bg-transparent py-1.5 pr-2 text-sm focus:outline-none"
                        onClick={e => e.stopPropagation()}
                    />
                </div>

                {/* Compare price input */}
                <div
                    role="presentation"
                    className={cn(
                        'flex items-center overflow-hidden rounded-lg border border-input bg-background text-sm',
                        isDisabled && 'pointer-events-none',
                    )}
                    onClick={e => e.stopPropagation()}
                >
                    <span className="px-2 py-1.5 text-xs text-muted-foreground">₽</span>
                    <input
                        type="number"
                        min={0}
                        placeholder={t('admin.products_edit.old_price_ph')}
                        value={variant.comparePrice || ''}
                        onChange={e => handlePriceChange('comparePrice', e.target.value)}
                        className="w-20 bg-transparent py-1.5 pr-2 text-sm focus:outline-none"
                        onClick={e => e.stopPropagation()}
                    />
                </div>

                {/* Discount badge or placeholder */}
                <div className="w-11 shrink-0 text-center">
                    {discount ? (
                        <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">
                            {discount}
                        </span>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    )}
                </div>

                {/* Enable / disable toggle */}
                <button
                    type="button"
                    onClick={e => {
                        e.stopPropagation();
                        onUpdate({enabled: !variant.enabled});
                    }}
                    className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-[7px] border transition-colors',
                        variant.enabled
                            ? 'border-primary/40 text-primary hover:bg-primary/10'
                            : 'border-destructive/50 text-destructive hover:bg-destructive/5',
                    )}
                    style={{opacity: 1}} // override parent opacity-35
                >
                    {variant.enabled
                        ? <CheckIcon className="size-3.5" />
                        : <XIcon className="size-3.5" />
                    }
                </button>

                {/* Delete button */}
                <button
                    type="button"
                    onClick={e => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                    }}
                    className="flex size-7 shrink-0 items-center justify-center rounded-[7px] border border-destructive/50 text-destructive transition-colors hover:bg-destructive/8"
                    style={{opacity: 1}} // override parent opacity-35
                >
                    <TrashIcon className="size-3.5" />
                </button>
            </div>

            {/* Delete confirmation overlay */}
            {showDeleteConfirm ? (
                <div className="absolute inset-0 z-10 flex animate-in fade-in-0 items-center justify-center gap-3 rounded-lg bg-background/95 backdrop-blur-sm">
                    <span className="text-sm">{t('admin.products_edit.delete_variant_confirm')}{displayIndex}?</span>
                    <button
                        type="button"
                        onClick={() => {
                            onDelete();
                            setShowDeleteConfirm(false);
                        }}
                        className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                    >
                        {t('admin.products_edit.delete_btn')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                    >
                        {t('admin.products_edit.actions.cancel')}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
