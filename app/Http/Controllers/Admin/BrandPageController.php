<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\ModerationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Раздел «Моя страница»: состояние персональной страницы бренда
 * и заявка на её публикацию.
 */
class BrandPageController extends Controller
{
    /**
     * Редакция условий публикации. Совпадает с текстом на витрине
     * (/brand-page-terms) — её же сохраняем в подтверждении менеджера.
     */
    public const TERMS_VERSION = '2026-09-21-2';

    /** Путь страницы условий на витрине. */
    private const TERMS_PATH = '/brand-page-terms';

    public function index(): Response
    {
        $brand = auth()->user()->getBrand();

        return Inertia::render('MyPage', [
            'brand' => $brand ? [
                'id' => $brand->id,
                'name' => $brand->name,
            ] : null,
            'brandPage' => $this->brandPagePayload($brand),
            'termsUrl' => rtrim((string) config('app.store_url'), '/').self::TERMS_PATH,
            'termsVersion' => self::TERMS_VERSION,
        ]);
    }

    /**
     * Заявка на публикацию персональной страницы бренда.
     */
    public function request(Request $request): RedirectResponse
    {
        // accepted — та самая галочка из окна подтверждения: без неё заявки нет.
        $validated = $request->validate([
            'accepted' => ['required', 'accepted'],
            'terms_version' => ['required', 'string', 'max:64'],
            'terms_text' => ['required', 'string', 'max:2000'],
        ]);

        $brand = auth()->user()->getBrand();

        if (! $brand) {
            return redirect()->back()->with('error', __('admin.my_page.errors.not_found'));
        }

        $userId = auth()->id();

        $error = DB::transaction(function () use ($brand, $userId, $validated) {
            // Блокировка бренда: два клика подряд не должны создать две заявки.
            $locked = Brand::query()->whereKey($brand->id)->lockForUpdate()->first();

            if (! $locked) {
                return 'not_found';
            }

            if ($locked->page_status === Brand::PAGE_STATUS_PUBLISHED) {
                return 'already_published';
            }

            $hasPending = $locked->moderationRequests()
                ->where('type', ModerationRequest::TYPE_BRAND_PAGE)
                ->where('status', ModerationRequest::STATUS_PENDING)
                ->exists();

            if ($hasPending) {
                return 'already_requested';
            }

            $locked->moderationRequests()->create([
                'type' => ModerationRequest::TYPE_BRAND_PAGE,
                'status' => ModerationRequest::STATUS_PENDING,
                // Снимок данных не храним: модератор смотрит бренд.
                // Зато храним подтверждение — кто, когда и с какой редакцией
                // условий согласился (п. 12 Условий публикации).
                'settings' => [
                    'terms' => [
                        'user_id' => $userId,
                        'accepted_at' => now()->toISOString(),
                        'version' => $validated['terms_version'],
                        'text' => $validated['terms_text'],
                    ],
                ],
            ]);

            $locked->update(['page_status' => Brand::PAGE_STATUS_PENDING]);

            return null;
        });

        if ($error !== null) {
            // flash.error подхватывает AdminLayout и показывает тостом.
            return redirect()->back()->with('error', __('admin.my_page.errors.'.$error));
        }

        return redirect()->back()->with('success', __('admin.my_page.messages.submitted'));
    }

    /**
     * Состояние персональной страницы бренда для раздела «Моя страница».
     */
    private function brandPagePayload(?Brand $brand): ?array
    {
        if (! $brand) {
            return null;
        }

        // created_at хранится с точностью до секунды — id вторым ключом,
        // иначе «последняя заявка» при совпадении секунды неопределена.
        $request = $brand->moderationRequests()
            ->where('type', ModerationRequest::TYPE_BRAND_PAGE)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->first();

        return [
            'page_status' => $brand->page_status,
            'page_published_at' => $brand->page_published_at?->toISOString(),
            // Адрес отдаём всегда, даже у неопубликованной страницы:
            // до публикации он показывается как пример будущей ссылки.
            'page_url' => $brand->pageUrl(),
            'request' => $request ? [
                'status' => $request->status,
                'created_at' => $request->created_at?->toISOString(),
                'reviewed_at' => $request->reviewed_at?->toISOString(),
                'reason' => $request->reason,
            ] : null,
        ];
    }
}
