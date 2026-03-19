<?php

namespace App\Enums;

enum FinancialStatus: string
{
    case Unpaid = 'unpaid';
    case PartialPaid = 'partial_paid';
    case Paid = 'paid';
    case Refunded = 'refunded';
}
