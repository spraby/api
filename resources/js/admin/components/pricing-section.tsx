import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLang } from '@/lib/lang';
import {parseNum} from "@/lib/utils.ts";

interface PricingValues {
    price: string;
    final_price: string;
    discount: string;
}

interface PricingSectionProps {
    price: string;
    finalPrice: string;
    discount: number;
    disabled?: boolean;
    required?: boolean;
    idPrefix?: string;
    onChange: (values: PricingValues) => void;
}

/**
 * Pricing section component with automatic discount calculation
 */
export function PricingSection({
                                   price,
                                   finalPrice,
                                   discount,
                                   disabled = false,
                                   required = false,
                                   idPrefix = '',
                                   onChange,
                               }: PricingSectionProps) {
    const { t } = useLang();

    const [discountInput, setDiscountInput] = useState<number>(discount);

    useEffect(() => {
        setDiscountInput(discount);
    }, [discount]);

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
        const d = Math.max(0, Math.min(100, newDiscount)); // Ограничение 0-100

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
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label className="flex items-center gap-1" htmlFor={`${idPrefix}price`}>
                    {t('admin.products_edit.fields.price')}
                    {!!required && <span className="text-destructive">*</span>}
                </Label>
                <Input
                    required={required}
                    disabled={disabled}
                    id={`${idPrefix}price`}
                    min="0"
                    placeholder={t('admin.products_edit.placeholders.price')}
                    step="0.01"
                    type="number"
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor={`${idPrefix}discount`}>%</Label>
                <Input
                    disabled={disabled}
                    id={`${idPrefix}discount`}
                    min="0"
                    max="100"
                    placeholder="0"
                    step="1"
                    type="number"
                    value={discountInput}
                    onChange={(e) => handleDiscountChange(parseInt(e.target.value) || 0)}
                />
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-1" htmlFor={`${idPrefix}final-price`}>
                    {t('admin.products_edit.fields.final_price')}
                    {!!required && <span className="text-destructive">*</span>}
                </Label>
                <Input
                    required={required}
                    disabled={disabled}
                    id={`${idPrefix}final-price`}
                    min="0"
                    placeholder={t('admin.products_edit.placeholders.final_price')}
                    step="0.01"
                    type="number"
                    value={finalPrice}
                    onChange={(e) => handleFinalPriceChange(e.target.value)}
                />
            </div>
        </div>
    );
}
