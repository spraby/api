import {useEffect, useState} from 'react';

import {BynCurrencyIcon} from '@/components/byn-currency-icon';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useLang} from '@/lib/lang';
import {parseNum} from "@/lib/utils.ts";

interface PricingValues {
    price: string;
    final_price: string;
    discount: string;
}

interface PricingSectionProps {
    price: string;
    finalPrice: string;
    disabled?: boolean;
    onChange: (values: PricingValues) => void;
}

/**
 * Pricing section component with automatic discount calculation
 */
export function PricingSection({
                                   price,
                                   finalPrice,
                                   disabled = false,
                                   onChange,
                               }: PricingSectionProps) {
    const {t} = useLang();

    const [discountInput, setDiscountInput] = useState<number>(0);

    useEffect(() => {
        const p = parseNum(price);
        const f = parseNum(finalPrice);

        if (p > 0 && f >= 0) {
            const calculatedDiscount = Math.round(((p - f) / p) * 100);

            setDiscountInput((current) => {
                if (calculatedDiscount !== current) {
                    return Math.max(0, Math.min(100, calculatedDiscount));
                }

                return current;
            });
        }
    }, [price, finalPrice]);

    /**
     *
     * @param newPrice
     */
    const handlePriceChange = (newPrice: string) => {
        const p = parseNum(newPrice);
        const d = discountInput;

        let newFinal = finalPrice;

        if (p > 0) {
            const calculatedFinal = p - (p * d) / 100;

            newFinal = calculatedFinal.toFixed(2);
        }

        onChange({
            price: newPrice,
            final_price: newFinal,
            discount: d.toString()
        });
    };

    /**
     *
     * @param newDiscount
     */
    const handleDiscountChange = (newDiscount: number) => {
        const d = Math.max(0, Math.min(100, newDiscount));

        setDiscountInput(d);

        const p = parseNum(price);
        const calculatedFinal = p - (p * d) / 100;

        onChange({
            price,
            final_price: calculatedFinal.toFixed(2),
            discount: d.toString()
        });
    };

    /**
     *
     * @param newFinalPrice
     */
    const handleFinalPriceChange = (newFinalPrice: string) => {
        onChange({
            price,
            final_price: newFinalPrice,
            discount: discountInput.toString()
        });
    };

    return (
        <div className="flex items-end gap-3 flex-nowrap">
            <div className="space-y-0">
                <Label className="flex items-center gap-1 text-muted-foreground text-xs">
                    {t('admin.products_edit.fields.price')}
                </Label>
                <Input
                    className="max-w-[100px] md:max-w-[120px]"
                    disabled={disabled}
                    min="0"
                    placeholder={t('admin.products_edit.placeholders.price')}
                    step="0.1"
                    type="number"
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                />
            </div>

            <div className="space-y-0">
                <Label className="flex items-center gap-1 text-muted-foreground text-xs">%</Label>
                <Input
                    className="max-w-20"
                    disabled={disabled}
                    min="0"
                    max="100"
                    placeholder="0"
                    step="1"
                    type="number"
                    value={discountInput}
                    onChange={(e) => handleDiscountChange(parseInt(e.target.value) || 0)}
                />
            </div>

            <div className="space-y-0">
                <Label className="flex items-center gap-1 text-muted-foreground text-xs text-nowrap">
                    {t('admin.products_edit.fields.final_price')}
                </Label>
                <Input
                    className="max-w-[100px] md:max-w-[120px]"
                    disabled={disabled}
                    min="0"
                    placeholder={t('admin.products_edit.placeholders.final_price')}
                    step="0.1"
                    type="number"
                    value={finalPrice}
                    onChange={(e) => handleFinalPriceChange(e.target.value)}
                />
            </div>

            <div className="inline-flex h-9 shrink-0 items-center text-muted-foreground">
                <BynCurrencyIcon className="h-4 w-4"/>
            </div>
        </div>
    );
}
