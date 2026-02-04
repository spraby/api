import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 *
 * @param val
 */
export function parseNum(val: string | number) {
    const n = typeof val === 'string' ? parseFloat(val) : val;

    return isNaN(n) ? 0 : n;
}

/**
 * Formats a number as money with currency
 * @param value - The numeric value to format
 * @param currency - Currency code (default: 'BYN')
 * @returns Formatted string like "123.45 BYN"
 */
export function toMoneyFormat(value: number | string | null | undefined, currency = 'BYN'): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (num === null || num === undefined || isNaN(num)) {
        return `0.00 ${currency}`;
    }

    return `${num.toFixed(2)} ${currency}`;
}
