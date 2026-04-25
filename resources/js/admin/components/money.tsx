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

function toNumber(value: number | string | null | undefined): number | null {
    const numericValue = typeof value === 'string' ? Number(value) : value;

    return typeof numericValue === 'number' && !Number.isNaN(numericValue) ? numericValue : null;
}

export function formatMoney(value: number | string | null | undefined): string {
    const numericValue = toNumber(value);

    return numericValue === null ? '—' : moneyFormatter.format(numericValue);
}

export function CurrencyIcon({currency = 'BYN', className}: {currency?: Currency; className?: string}) {
    const Icon = CURRENCY_ICONS[currency];

    return <Icon className={cn('h-[1em] w-[1em]', className)}/>;
}

interface MoneyProps {
    value: number | string | null | undefined;
    currency?: Currency;
    className?: string;
}

export function Money({value, currency = 'BYN', className}: MoneyProps) {
    const numericValue = toNumber(value);

    if (numericValue === null) {
        return <span className={cn(className)}>—</span>;
    }

    return (
        <span className={cn('inline-flex items-center gap-1', className)}>
            {moneyFormatter.format(numericValue)}
            <CurrencyIcon currency={currency}/>
        </span>
    );
}
