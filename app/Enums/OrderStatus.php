<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Processing = 'processing';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Archived = 'archived';

    public static function excluded(): array
    {
        return [self::Cancelled->value, self::Archived->value];
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
