<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\CategoryRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class AdminOnboardingService
{
    public const HINTS = [
        'categories',
        'settings',
        'product',
    ];

    private const SETTINGS_SECTIONS = [
        'general',
        'addresses',
        'delivery',
        'contacts',
    ];

    public function findBrand(User $user): ?Brand
    {
        return $user->brands()
            ->withExists([
                'products as has_published_products' => fn (Builder $query) => $query->where('enabled', true),
            ])
            ->withCount([
                'categories',
                'addresses',
                'contacts',
                'shippingMethods',
            ])
            ->first();
    }

    public function build(User $user, ?Brand $brand): ?array
    {
        if (! $user->isManager()) {
            return null;
        }

        if ($brand && ! array_key_exists('has_published_products', $brand->getAttributes())) {
            $brand->loadExists([
                'products as has_published_products' => fn (Builder $query) => $query->where('enabled', true),
            ]);
            $brand->loadCount([
                'categories',
                'addresses',
                'contacts',
                'shippingMethods',
            ]);
        }

        $latestRequest = $brand
            ? CategoryRequest::query()
                ->where('brand_id', $brand->id)
                ->latest('created_at')
                ->first(['status'])
            : null;

        $skippedSettings = array_values(array_intersect(
            $user->onboarding_skipped_steps ?? [],
            $this->settingsStepKeys(),
        ));
        $hiddenHints = array_values(array_intersect(
            $user->onboarding_hidden_hints ?? [],
            self::HINTS,
        ));

        $hasAttachedCategories = (int) ($brand?->categories_count ?? 0) > 0;
        $categoryStatus = $latestRequest?->status ?? ($hasAttachedCategories ? CategoryRequest::STATUS_APPROVED : 'not_submitted');
        $categoryComplete = $hasAttachedCategories || in_array($categoryStatus, [
            CategoryRequest::STATUS_PENDING,
            CategoryRequest::STATUS_APPROVED,
            CategoryRequest::STATUS_PARTIAL,
        ], true);

        $settingsFilled = [
            'general' => $this->hasText($brand?->about) || $this->hasText($brand?->refund_policy),
            'addresses' => (int) ($brand?->addresses_count ?? 0) > 0,
            'delivery' => (int) ($brand?->shipping_methods_count ?? 0) > 0,
            'contacts' => (int) ($brand?->contacts_count ?? 0) > 0,
        ];

        $settingsResolvedCount = 0;
        foreach (self::SETTINGS_SECTIONS as $section) {
            if ($settingsFilled[$section] || in_array("settings.{$section}", $skippedSettings, true)) {
                $settingsResolvedCount++;
            }
        }

        $settingsTotal = count(self::SETTINGS_SECTIONS);
        $settingsComplete = $settingsResolvedCount === $settingsTotal;

        $productComplete = (bool) ($brand?->has_published_products ?? false);

        $completedSteps = collect([$categoryComplete, $settingsComplete, $productComplete])
            ->filter()
            ->count();

        $currentStep = match (true) {
            ! $categoryComplete => 'categories',
            ! $settingsComplete => 'settings',
            ! $productComplete => 'product',
            default => 'complete',
        };

        $isComplete = $completedSteps === 3;

        return [
            'visible' => ! $user->onboarding_dismissed_at || ! $isComplete,
            'can_dismiss' => $isComplete,
            'hidden_hints' => $hiddenHints,
            'progress' => [
                'completed' => $completedSteps,
                'total' => 3,
                'current_step' => $currentStep,
            ],
            'steps' => [
                'categories' => [
                    'completed' => $categoryComplete,
                    'status' => $categoryStatus,
                ],
                'settings' => [
                    'completed' => $settingsComplete,
                    'resolved_count' => $settingsResolvedCount,
                    'total' => $settingsTotal,
                ],
                'product' => [
                    'completed' => $productComplete,
                    'blocked' => ! $hasAttachedCategories,
                ],
            ],
        ];
    }

    public function update(User $user, string $action, ?string $step = null): ?array
    {
        $brand = $this->findBrand($user);
        $hiddenHints = array_values(array_intersect(
            $user->onboarding_hidden_hints ?? [],
            self::HINTS,
        ));

        if ($action === 'dismiss') {
            $state = $this->build($user, $brand);

            if (! data_get($state, 'can_dismiss', false)) {
                return $state;
            }

            $user->forceFill(['onboarding_dismissed_at' => now()])->save();
        }

        if ($action === 'hide_hint' && in_array($step, self::HINTS, true)) {
            $hiddenHints[] = $step;
            $updates = [
                'onboarding_hidden_hints' => array_values(array_unique($hiddenHints)),
            ];

            if ($step === 'settings') {
                $skippedSettings = array_values(array_intersect(
                    $user->onboarding_skipped_steps ?? [],
                    $this->settingsStepKeys(),
                ));
                $skippedSettings = [...$skippedSettings, ...$this->settingsStepKeys()];
                $updates['onboarding_skipped_steps'] = array_values(array_unique($skippedSettings));
            }

            $user->forceFill($updates)->save();
        }

        return $this->build($user->refresh(), $brand);
    }

    private function hasText(?string $value): bool
    {
        return trim((string) $value) !== '';
    }

    private function settingsStepKeys(): array
    {
        return array_map(
            fn (string $section) => "settings.{$section}",
            self::SETTINGS_SECTIONS,
        );
    }
}
