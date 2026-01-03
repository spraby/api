<?php

namespace App\Filament\Actions;

use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;

class Utilities
{
    public static function updateFinalPrice(Get $get, Set $set): void
    {
        $price = (float) $get('price');
        $percentage = (float) $get('discount');

        if ($price < 0 || $percentage < 0) {
            $set('price', 0);
            $set('final_price', 0);

            return;
        }

        $finalPrice = $price - ($price * $percentage / 100);

        $set('final_price', round($finalPrice, 2));
    }

    public static function updateDiscountValue(Get $get, Set $set): void
    {
        $price = (float) $get('price');
        $finalPrice = (float) $get('final_price');

        if ($price < 0 || $finalPrice < 0) {
            $set('price', 0);
            $set('final_price', 0);
        }

        if ($finalPrice >= $price || $finalPrice < 0) {
            $set('final_price', $price);
            $set('discount', 0);

            return;
        }

        if ($price <= 0) {
            $set('discount', 0);

            return;
        }

        $discount = (($price - $finalPrice) / $price) * 100;
        $set('discount', round($discount, 0));
    }
}
