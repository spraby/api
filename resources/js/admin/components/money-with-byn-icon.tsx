import {BynCurrencyIcon} from '@/components/byn-currency-icon';
import {cn} from '@/lib/utils';

const defaultMoneyFormatter = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

interface MoneyWithBynIconProps {
    value: number | string | null | undefined;
    formatter?: Intl.NumberFormat;
    className?: string;
    valueClassName?: string;
    iconClassName?: string;
    fallback?: string;
}

export function MoneyWithBynIcon({
    value,
    formatter = defaultMoneyFormatter,
    className,
    valueClassName,
    iconClassName,
    fallback = '—',
}: MoneyWithBynIconProps) {
    const numericValue = typeof value === 'string' ? Number(value) : value;

    if (typeof numericValue !== 'number' || Number.isNaN(numericValue)) {
        return <span className={cn(valueClassName)}>{fallback}</span>;
    }

    return (
        <span className={cn('inline-flex items-center gap-1', className)}>
            <span className={cn(valueClassName)}>{formatter.format(numericValue)}</span>
            <BynCurrencyIcon className={cn('h-3.5 w-3.5', iconClassName)}/>
        </span>
    );
}
