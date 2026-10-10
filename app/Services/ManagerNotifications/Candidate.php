<?php

namespace App\Services\ManagerNotifications;

use App\Models\Brand;
use Carbon\CarbonInterface;

/**
 * Бренд, которому сейчас положено письмо, и от какого события оно отсчитано.
 */
final readonly class Candidate
{
    public function __construct(
        public Brand $brand,
        public CarbonInterface $anchorAt,
        public int $sequence,
    ) {}
}
