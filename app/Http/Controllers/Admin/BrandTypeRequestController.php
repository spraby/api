<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandTypeRequest;
use App\Models\Brand;
use App\Models\ModerationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

/**
 * Заявка продавца на смену типа аккаунта (мастер/бизнес), формы занятости
 * и реквизитов. Сам бренд меняет модератор, одобряя заявку в «Модерации».
 */
class BrandTypeRequestController extends Controller
{
    public function store(StoreBrandTypeRequest $request): RedirectResponse
    {
        $brand = auth()->user()->getBrand();

        if (! $brand) {
            return redirect()->back()->with('error', __('admin.brand_type_request.errors.not_found'));
        }

        // validated(): у мастера реквизиты исключены правилами, даже если их прислали.
        $validated = $request->validated();
        $requested = [
            'type' => $validated['type'],
            'employment_type' => $validated['employment_type'],
            'employment_name' => $validated['employment_name'] ?? null,
            'employment_number' => $validated['employment_number'] ?? null,
        ];
        $userId = auth()->id();

        $error = DB::transaction(function () use ($brand, $requested, $userId) {
            // Блокировка бренда: два клика подряд не должны создать две заявки.
            $locked = Brand::query()->whereKey($brand->id)->lockForUpdate()->first();

            if (! $locked) {
                return 'not_found';
            }

            $hasPending = $locked->moderationRequests()
                ->where('type', ModerationRequest::TYPE_BRAND_TYPE)
                ->where('status', ModerationRequest::STATUS_PENDING)
                ->exists();

            if ($hasPending) {
                return 'already_requested';
            }

            $current = self::currentValues($locked);

            if ($current === $requested) {
                return 'nothing_changed';
            }

            $locked->moderationRequests()->create([
                'type' => ModerationRequest::TYPE_BRAND_TYPE,
                'status' => ModerationRequest::STATUS_PENDING,
                // Храним и запрошенное, и то, что было: бренд может
                // поменяться до решения, а модератор должен видеть исходник.
                'settings' => [
                    'requested' => $requested,
                    'previous' => $current,
                    'user_id' => $userId,
                ],
            ]);

            return null;
        });

        if ($error !== null) {
            return redirect()->back()->with('error', __('admin.brand_type_request.errors.'.$error));
        }

        return redirect()->back()->with('success', __('admin.brand_type_request.messages.submitted'));
    }

    /**
     * Текущие значения бренда в той же форме, что и запрошенные.
     * Реквизиты есть только у бизнеса — у мастера сравниваем с null.
     *
     * @return array{type: string, employment_type: ?string, employment_name: ?string, employment_number: ?string}
     */
    public static function currentValues(Brand $brand): array
    {
        $isBusiness = $brand->type === Brand::TYPE_BUSINESS;

        return [
            'type' => $brand->type,
            'employment_type' => $brand->employment_type,
            'employment_name' => $isBusiness ? $brand->employment_name : null,
            'employment_number' => $isBusiness ? $brand->employment_number : null,
        ];
    }
}
