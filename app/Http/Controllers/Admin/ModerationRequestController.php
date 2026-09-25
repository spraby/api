<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProcessModerationRequest;
use App\Models\Brand;
use App\Models\ModerationRequest;
use App\Support\BrandPagePreview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
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
            ->orderByDesc('id')
            ->get()
            ->map(fn (ModerationRequest $r) => $this->serialize($r));

        return Inertia::render('Moderation', [
            'moderationRequests' => $requests,
            'types' => ModerationRequest::typesForSource(Brand::class),
            'statuses' => ModerationRequest::STATUSES,
        ]);
    }

    public function show(ModerationRequest $moderationRequest): Response
    {
        $this->authorize('view', $moderationRequest);

        $moderationRequest->load(['source', 'reviewer']);

        // Страница одна на все типы заявок: общая часть приходит в request,
        // а details собирает тот, кто знает про конкретный источник.
        return Inertia::render('ModerationShow', [
            'request' => $this->serialize($moderationRequest),
            'details' => $this->details($moderationRequest),
            // Решение принимают только по ещё не обработанной заявке.
            'canReview' => $moderationRequest->status === ModerationRequest::STATUS_PENDING
                && auth()->user()?->can('update', $moderationRequest),
        ]);
    }

    public function approve(ProcessModerationRequest $request, ModerationRequest $moderationRequest): RedirectResponse
    {
        return $this->process($request, $moderationRequest, ModerationRequest::STATUS_APPROVED);
    }

    public function reject(ProcessModerationRequest $request, ModerationRequest $moderationRequest): RedirectResponse
    {
        return $this->process($request, $moderationRequest, ModerationRequest::STATUS_REJECTED);
    }

    /**
     * Общая часть решения: проверка, что заявка ещё не обработана,
     * отметка модератора и побочные эффекты под тип заявки.
     */
    private function process(ProcessModerationRequest $request, ModerationRequest $moderationRequest, string $status): RedirectResponse
    {
        $this->authorize('update', $moderationRequest);

        $error = DB::transaction(function () use ($request, $moderationRequest, $status) {
            // Блокировка: две вкладки не должны обработать одну заявку дважды.
            $locked = ModerationRequest::query()
                ->whereKey($moderationRequest->id)
                ->lockForUpdate()
                ->first();

            if (! $locked || $locked->status !== ModerationRequest::STATUS_PENDING) {
                return 'already_processed';
            }

            $sideEffect = $this->applyDecision($locked, $status);

            if ($sideEffect !== null) {
                return $sideEffect;
            }

            $locked->update([
                'status' => $status,
                'reason' => $request->input('reason'),
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            return null;
        });

        if ($error !== null) {
            return redirect()->back()->with('error', __('admin.moderation.show.errors.'.$error));
        }

        $message = $status === ModerationRequest::STATUS_APPROVED
            ? __('admin.moderation.show.messages.approved')
            : __('admin.moderation.show.messages.rejected');

        return redirect()->back()->with('success', $message);
    }

    /**
     * Что делает решение с самим ресурсом. Возвращает код ошибки,
     * если применить решение нельзя.
     */
    private function applyDecision(ModerationRequest $r, string $status): ?string
    {
        return match ($r->type) {
            ModerationRequest::TYPE_BRAND_PAGE => $this->applyBrandPageDecision($r, $status),
            ModerationRequest::TYPE_BRAND_TYPE => $this->applyBrandTypeDecision($r, $status),
            default => null,
        };
    }

    private function applyBrandPageDecision(ModerationRequest $r, string $status): ?string
    {
        $brand = $r->source;

        if (! $brand instanceof Brand) {
            return 'source_missing';
        }

        if ($status === ModerationRequest::STATUS_REJECTED) {
            // Страница остаётся неопубликованной, бренд может подать заявку заново.
            $brand->update(['page_status' => Brand::PAGE_STATUS_DRAFT]);

            return null;
        }

        // Без домена публиковать нечего: адрес страницы собирается из него.
        if (! $brand->domain) {
            return 'domain_required';
        }

        $brand->update([
            'page_status' => Brand::PAGE_STATUS_PUBLISHED,
            'page_published_at' => now(),
        ]);

        return null;
    }

    private function applyBrandTypeDecision(ModerationRequest $r, string $status): ?string
    {
        $brand = $r->source;

        if (! $brand instanceof Brand) {
            return 'source_missing';
        }

        // Отказ бренд не меняет: остаётся прежний тип, продавец может подать заново.
        if ($status === ModerationRequest::STATUS_REJECTED) {
            return null;
        }

        $requested = $r->settings['requested'] ?? null;

        if (! is_array($requested) || ! in_array($requested['type'] ?? null, Brand::TYPES, true)) {
            return 'invalid_payload';
        }

        $isBusiness = $requested['type'] === Brand::TYPE_BUSINESS;

        $brand->update([
            'type' => $requested['type'],
            'employment_type' => $requested['employment_type'] ?? null,
            // У мастера реквизитов нет — старые бизнес-реквизиты не оставляем.
            'employment_name' => $isBusiness ? ($requested['employment_name'] ?? null) : null,
            'employment_number' => $isBusiness ? ($requested['employment_number'] ?? null) : null,
        ]);

        return null;
    }

    /**
     * Детали заявки под её тип. Неизвестный тип — не ошибка:
     * страница покажет общую часть и скажет, что деталей нет.
     */
    private function details(ModerationRequest $r): ?array
    {
        return match ($r->type) {
            ModerationRequest::TYPE_BRAND_PAGE => $this->brandPageDetails($r),
            ModerationRequest::TYPE_BRAND_TYPE => $this->brandTypeDetails($r),
            default => null,
        };
    }

    private function brandPageDetails(ModerationRequest $r): ?array
    {
        $brand = $r->source;

        if (! $brand instanceof Brand) {
            return null;
        }

        $brand->loadMissing(['image', 'user', 'contacts']);

        return [
            'kind' => 'brand_page',
            // Хэндл в заявке можно только назначить: уже сохранённый меняют
            // на странице бренда, чтобы не переписывать живой адрес из модерации.
            'can_edit_domain' => ! $brand->domain && (auth()->user()?->can('updateDomain', Brand::class) ?? false),
            'brand' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'employment_type_label' => $brand->employment_type_label,
                'domain' => $brand->domain,
                // Поле домена в заявке предзаполняется: свой домен, а если
                // его нет — транскрипция названия бренда.
                'suggested_domain' => $brand->domain ?: $brand->suggestedDomain(),
                'page_status' => $brand->page_status,
                'page_published_at' => $brand->page_published_at?->toISOString(),
                // Публичный адрес — только у опубликованной страницы.
                'page_url' => $brand->page_status === Brand::PAGE_STATUS_PUBLISHED
                    ? $brand->pageUrl()
                    : null,
                // Неопубликованную страницу админ смотрит по подписанной ссылке.
                'preview_url' => $brand->page_status === Brand::PAGE_STATUS_PUBLISHED
                    ? null
                    : BrandPagePreview::url($brand),
                'admin_url' => '/admin/brands/'.$brand->id.'/edit',
                'created_at' => $brand->created_at?->toISOString(),
                'logo_url' => $brand->image?->url,
                // Описания хранятся как HTML: в админку отдаём текстом,
                // чтобы не вставлять чужую разметку в страницу модератора.
                'about' => $this->plainText($brand->about),
                'refund_policy' => $this->plainText($brand->refund_policy),
            ],
            'owner' => $brand->user ? [
                'id' => $brand->user->id,
                'name' => trim(($brand->user->first_name ?? '').' '.($brand->user->last_name ?? '')) ?: null,
                'email' => $brand->user->email,
                'phone' => $brand->user->phone,
                'admin_url' => '/admin/users/'.$brand->user->id.'/edit',
            ] : null,
            'contacts' => $brand->contacts
                ->map(fn ($contact) => ['type' => $contact->type, 'value' => $contact->value])
                ->values()
                ->all(),
            'stats' => [
                'products' => $brand->products()->count(),
                'categories' => $brand->categories()->count(),
            ],
        ];
    }

    private function brandTypeDetails(ModerationRequest $r): ?array
    {
        $brand = $r->source;

        if (! $brand instanceof Brand) {
            return null;
        }

        $brand->loadMissing('user');

        $values = fn (?array $v) => $v === null ? null : [
            'type' => $v['type'] ?? null,
            'employment_type' => $v['employment_type'] ?? null,
            'employment_type_label' => Brand::employmentTypeLabel($v['employment_type'] ?? null),
            'employment_name' => $v['employment_name'] ?? null,
            'employment_number' => $v['employment_number'] ?? null,
        ];

        return [
            'kind' => 'brand_type',
            'brand' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'admin_url' => '/admin/brands/'.$brand->id.'/edit',
            ],
            'owner' => $brand->user ? [
                'id' => $brand->user->id,
                'name' => trim(($brand->user->first_name ?? '').' '.($brand->user->last_name ?? '')) ?: null,
                'email' => $brand->user->email,
                'admin_url' => '/admin/users/'.$brand->user->id.'/edit',
            ] : null,
            // Снимок на момент подачи; текущее состояние бренда — отдельно,
            // оно могло измениться, пока заявка ждала решения.
            'previous' => $values($r->settings['previous'] ?? null),
            'requested' => $values($r->settings['requested'] ?? null),
            'current' => $values(BrandTypeRequestController::currentValues($brand)),
        ];
    }

    private function plainText(?string $html): ?string
    {
        if (! $html) {
            return null;
        }

        $text = trim(html_entity_decode(strip_tags(preg_replace('/<\/(p|div|li|h[1-6])>/i', "$0\n", $html) ?? $html)));

        return $text === '' ? null : $text;
    }

    private function serialize(ModerationRequest $r): array
    {
        return [
            'id' => $r->id,
            'type' => $r->type,
            'status' => $r->status,
            'reason' => $r->reason,
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
        } ?: class_basename($r->source_type).' #'.$r->source_id;

        $adminUrl = $source === null ? null : match ($r->source_type) {
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
