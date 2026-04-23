import type {ReactNode} from 'react';

import {BynCurrencyIcon} from '@/components/byn-currency-icon';
import {useLang} from '@/lib/lang';
import type {Variant} from '@/types/data';

interface Props {
    title: string;
    categoryName: string | null;
    imagesCount: number;
    variants: Variant[];
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
    const {t} = useLang();
    const activeCount = variants.filter(v => v.enabled).length;
    const prices = variants.map(v => Number(v.final_price) || 0).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

    let priceRange: string | null = null;

    if (minPrice !== null && maxPrice !== null) {
        if (minPrice === maxPrice) {
            priceRange = fmt(minPrice);
        } else {
            priceRange = `${fmt(minPrice)} — ${fmt(maxPrice)}`;
        }
    }

    const discountedCount = variants.filter(
        v => Number(v.price) > Number(v.final_price) && Number(v.final_price) > 0,
    ).length;

    return (
        <div className="rounded-xl border bg-muted/30 p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('admin.products_edit.summary_header')}
            </p>

            <SummaryRow
                label={t('admin.products_edit.summary_name')}
                value={title.trim() ? title : '—'}
            />
            <SummaryRow
                label={t('admin.products_edit.summary_category')}
                value={categoryName ?? '—'}
            />
            <SummaryRow
                label={t('admin.products_edit.summary_images')}
                value={imagesCount > 0 ? imagesCount : '—'}
            />

            <hr className="my-2 border-border" />

            <SummaryRow
                label={t('admin.products_edit.summary_variants')}
                value={
                    activeCount > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400">{activeCount}</span>
                    ) : (
                        '—'
                    )
                }
            />
            <SummaryRow
                label={t('admin.products_edit.summary_price')}
                value={
                    priceRange ? (
                        <span className="inline-flex items-center gap-1 font-mono font-bold">
                            <span>{priceRange}</span>
                            <BynCurrencyIcon className="h-[14px] w-[14px]"/>
                        </span>
                    ) : (
                        '—'
                    )
                }
            />

            {discountedCount > 0 && (
                <SummaryRow
                    label={t('admin.products_edit.summary_discounted')}
                    value={
                        <span className="rounded border border-green-300 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300">
                            {discountedCount} {t('admin.products_edit.summary_var_short')}
                        </span>
                    }
                />
            )}
        </div>
    );
}
