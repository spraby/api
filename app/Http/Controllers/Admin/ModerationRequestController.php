<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\ModerationRequest;
use Inertia\Inertia;
use Inertia\Response;

class ModerationRequestController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', ModerationRequest::class);

        // Страница показывает только заявки от брендов: источники других
        // типов (появятся позже) сюда не попадают.
        $requests = ModerationRequest::with(['source', 'reviewer'])
            ->fromBrands()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (ModerationRequest $r) => $this->serialize($r));

        return Inertia::render('Moderation', [
            'moderationRequests' => $requests,
            'types' => ModerationRequest::typesForSource(Brand::class),
            'statuses' => ModerationRequest::STATUSES,
        ]);
    }

    private function serialize(ModerationRequest $r): array
    {
        return [
            'id' => $r->id,
            'type' => $r->type,
            'status' => $r->status,
            'reason' => $r->reason,
            'settings' => $r->settings,
            'reviewed_at' => $r->reviewed_at?->toISOString(),
            'created_at' => $r->created_at?->toISOString(),
            'source' => $this->resolveSource($r),
            'reviewer' => $r->reviewer ? [
                'id' => $r->reviewer->id,
                'email' => $r->reviewer->email,
                'first_name' => $r->reviewer->first_name,
                'last_name' => $r->reviewer->last_name,
            ] : null,
        ];
    }

    /**
     * Морф-связь без внешнего ключа: ресурс мог быть удалён уже после
     * создания заявки, поэтому $r->source может прийти пустым.
     */
    private function resolveSource(ModerationRequest $r): ?array
    {
        $source = $r->source;

        $label = match ($r->source_type) {
            Brand::class => $source?->name,
            default => null,
        } ?? class_basename($r->source_type).' #'.$r->source_id;

        $adminUrl = match ($r->source_type) {
            Brand::class => '/admin/brands/'.$r->source_id.'/edit',
            default => null,
        };

        return [
            'type' => $r->source_type,
            'id' => $r->source_id,
            'label' => $label,
            'admin_url' => $adminUrl,
            'exists' => $source !== null,
        ];
    }
}
