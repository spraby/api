import type {ReactNode} from 'react';

import type {LocalVariant} from '@/hooks/use-product-form';

interface Props {
    title: string;
    categoryName: string | null;
    imagesCount: number;
    variants: LocalVariant[];
}

interface SummaryRowProps {
    label: string;
    value: ReactNode;
}

function SummaryRow({label, value}: SummaryRowProps) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium">{value}</span>
        </div>
    );
}

function fmt(n: number): string {
    return new Intl.NumberFormat('ru-RU').format(n);
}

export function ProductSummaryCard({title, categoryName, imagesCount, variants}: Props) {
    const activeCount = variants.filter(v => v.enabled).length;
    const prices = variants.filter(v => v.price > 0).map(v => v.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

    let priceRange: string | null = null;

    if (minPrice !== null && maxPrice !== null) {
        if (minPrice === maxPrice) {
            priceRange = `${fmt(minPrice)} ₽`;
        } else {
            priceRange = `${fmt(minPrice)} — ${fmt(maxPrice)} ₽`;
        }
    }

    const discountedCount = variants.filter(
        v => v.comparePrice > v.price && v.price > 0,
    ).length;

    return (
        <div className="rounded-xl border bg-muted/30 p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                СВОДКА
            </p>

            <SummaryRow
                label="Название"
                value={title.trim() ? title : '—'}
            />
            <SummaryRow
                label="Категория"
                value={categoryName ?? '—'}
            />
            <SummaryRow
                label="Изображения"
                value={imagesCount > 0 ? imagesCount : '—'}
            />

            <hr className="my-2 border-border" />

            <SummaryRow
                label="Вариантов"
                value={
                    activeCount > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400">{activeCount}</span>
                    ) : (
                        '—'
                    )
                }
            />
            <SummaryRow
                label="Цена"
                value={
                    priceRange ? (
                        <span className="font-mono font-bold">{priceRange}</span>
                    ) : (
                        '—'
                    )
                }
            />

            {discountedCount > 0 && (
                <SummaryRow
                    label="Со скидкой"
                    value={
                        <span className="rounded border border-green-300 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300">
                            {discountedCount} вар.
                        </span>
                    }
                />
            )}
        </div>
    );
}
