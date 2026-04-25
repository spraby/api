import {BynCurrencyIcon} from '@/components/byn-currency-icon';
import {cn} from '@/lib/utils';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const CURRENCY_ICONS = {
    BYN: BynCurrencyIcon,
} as const;

type Currency = keyof typeof CURRENCY_ICONS;

interface MoneyProps {
    value: number | string | null | undefined;
    currency?: Currency;
    className?: string;
}

export function Money({value, currency = 'BYN', className}: MoneyProps) {
    const numericValue = typeof value === 'string' ? Number(value) : value;

    if (typeof numericValue !== 'number' || Number.isNaN(numericValue)) {
        return <span className={cn(className)}>—</span>;
    }

    const Icon = CURRENCY_ICONS[currency];

    return (
        <span className={cn('inline-flex items-center gap-1', className)}>
            {moneyFormatter.format(numericValue)}
            <Icon className="h-[1em] w-[1em]"/>
        </span>
    );
}
