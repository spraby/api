<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\EmailMessage;
use App\Models\ManagerNotification;
use App\Models\ManagerNotificationDelivery;
use App\Models\User;
use App\Services\EmailSender;
use App\Services\ManagerNotifications\ManagerNotificationDispatcher;
use App\Services\ManagerNotifications\ManagerNotificationRegistry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ManagerNotificationController extends Controller
{
    /** Сколько отправок показывать на странице и догружать кнопкой «Ещё». */
    private const DELIVERIES_PER_PAGE = 10;

    private const RECIPIENTS_LIMIT = 50;

    private const MANUAL_SEND_LIMIT = 200;

    public function __construct(
        private readonly ManagerNotificationRegistry $registry,
        private readonly ManagerNotificationDispatcher $dispatcher,
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', ManagerNotification::class);

        $notifications = ManagerNotification::query()
            ->withCount([
                'deliveries',
                'deliveries as deliveries_last_30_days_count' => fn (Builder $q) => $q->where('created_at', '>=', now()->subDays(30)),
            ])
            ->orderBy('id')
            ->get()
            ->map(fn (ManagerNotification $n) => [
                ...$this->serialize($n),
                'deliveries_count' => $n->deliveries_count,
                'deliveries_last_30_days_count' => $n->deliveries_last_30_days_count,
            ]);

        return Inertia::render('ManagerNotifications', [
            'notifications' => $notifications,
        ]);
    }

    public function show(ManagerNotification $managerNotification, EmailSender $sender): Response
    {
        $this->authorize('view', $managerNotification);

        $handler = $this->registry->has($managerNotification)
            ? $this->registry->handler($managerNotification)
            : null;

        return Inertia::render('ManagerNotificationShow', [
            'notification' => [
                ...$this->serialize($managerNotification),
                'conditions_text' => $handler?->describe($managerNotification) ?? [],
                'subject' => $handler?->subject(),
                'preheader' => $handler?->preheader(),
            ],
            'previewHtml' => $handler ? $this->preview($managerNotification, $sender) : null,
            'deliveries' => $this->deliveriesPage($managerNotification, null),
            'canEdit' => (bool) auth()->user()?->can('update', $managerNotification),
        ]);
    }

    /** Вкл/выкл и час отправки — всё, что админ пока может менять. */
    public function update(Request $request, ManagerNotification $managerNotification): RedirectResponse
    {
        $this->authorize('update', $managerNotification);

        $validated = $request->validate([
            'send_hour' => ['required', 'integer', 'between:0,23'],
            'enabled' => ['required', 'boolean'],
        ]);

        $managerNotification->update($validated);

        return back()->with('success', __('admin.manager_notifications.flash.saved'));
    }

    /**
     * Следующая порция отправок для кнопки «Ещё»: всё, что старше последней
     * показанной строки. Курсор, а не offset — новые отправки между нажатиями
     * не сдвигают выборку и не дают дублей.
     */
    public function deliveries(Request $request, ManagerNotification $managerNotification): JsonResponse
    {
        $this->authorize('view', $managerNotification);

        $validated = $request->validate(['before_id' => ['required', 'integer', 'min:1']]);

        return response()->json($this->deliveriesPage($managerNotification, (int) $validated['before_id']));
    }

    /**
     * Бренды для ручной отправки: поиск по названию бренда, имени и email
     * владельца. sent_today — для предупреждения о повторной отправке.
     */
    public function recipients(Request $request, ManagerNotification $managerNotification): JsonResponse
    {
        $this->authorize('update', $managerNotification);

        $search = trim((string) $request->query('search', ''));

        $brands = $this->notifiableBrands()
            ->when($search !== '', function (Builder $q) use ($search) {
                // % и _ из строки поиска — обычные символы, а не шаблон.
                $like = '%'.addcslashes($search, '%_\\').'%';
                $q->where(fn (Builder $w) => $w
                    ->whereLike('brands.name', $like)
                    ->orWhereHas('user', fn (Builder $u) => $u
                        ->whereLike('email', $like)
                        ->orWhereLike('first_name', $like)
                        ->orWhereLike('last_name', $like)));
            })
            ->orderBy('brands.name')
            ->limit(self::RECIPIENTS_LIMIT)
            ->get();

        $sentToday = $this->sentTodayBrandIds($managerNotification, $brands->pluck('id')->all());

        return response()->json([
            'recipients' => $brands->map(fn (Brand $brand) => [
                'brand_id' => $brand->id,
                'brand_name' => $brand->name,
                'user_name' => $this->userName($brand->user),
                'user_email' => $brand->user?->email,
                'sent_today' => in_array($brand->id, $sentToday, true),
            ])->values(),
        ]);
    }

    /** Ручная отправка выбранным брендам — без проверки условий. */
    public function send(Request $request, ManagerNotification $managerNotification): RedirectResponse
    {
        $this->authorize('update', $managerNotification);
        abort_unless($this->registry->has($managerNotification), 404);

        $validated = $request->validate([
            'brand_ids' => ['required', 'array', 'min:1', 'max:'.self::MANUAL_SEND_LIMIT],
            'brand_ids.*' => ['integer', 'distinct'],
        ]);

        $brands = $this->notifiableBrands()->whereIn('brands.id', $validated['brand_ids'])->get();

        // Чужие, несуществующие или бренды без оповещаемого владельца — отказ целиком.
        if ($brands->count() !== count($validated['brand_ids'])) {
            throw ValidationException::withMessages([
                'brand_ids' => __('admin.manager_notifications.errors.invalid_recipients'),
            ]);
        }

        // Каждый бренд отдельно: сбой на одном не должен скрыть, что остальным
        // письма уже поставлены (иначе повторная попытка их задублирует).
        $queued = 0;
        $failed = 0;
        foreach ($brands as $brand) {
            try {
                if ($this->dispatcher->dispatchManual($managerNotification, $brand, $request->user())) {
                    $queued++;
                }
            } catch (Throwable $e) {
                report($e);
                $failed++;
            }
        }

        if ($failed > 0) {
            return back()->with('error', __('admin.manager_notifications.flash.queued_with_errors', [
                'count' => $queued,
                'failed' => $failed,
            ]));
        }

        return back()->with('success', __('admin.manager_notifications.flash.queued', ['count' => $queued]));
    }

    /** @return Builder<Brand> */
    private function notifiableBrands(): Builder
    {
        return Brand::query()
            ->whereNotNull('user_id')
            ->whereHas('user', fn (Builder $q) => $q->notifiableManagers())
            ->with('user');
    }

    /**
     * Бренды из списка, которым это оповещение уже ставилось сегодня (по Минску),
     * автоматически или вручную.
     *
     * @param  list<int>  $brandIds
     * @return list<int>
     */
    private function sentTodayBrandIds(ManagerNotification $notification, array $brandIds): array
    {
        if ($brandIds === []) {
            return [];
        }

        $startOfToday = Carbon::now(ManagerNotification::TIMEZONE)->startOfDay()->utc();

        return $notification->deliveries()
            ->whereIn('brand_id', $brandIds)
            ->where('created_at', '>=', $startOfToday)
            ->distinct()
            ->pluck('brand_id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    /** Отправки от новых к старым; $beforeId — только старше этой строки. */
    private function deliveriesPage(ManagerNotification $notification, ?int $beforeId): array
    {
        $rows = $notification->deliveries()
            ->with(['brand', 'user', 'sentBy', 'emailMessage'])
            ->when($beforeId, fn (Builder $q) => $q->where('id', '<', $beforeId))
            ->orderByDesc('id')
            ->limit(self::DELIVERIES_PER_PAGE + 1)
            ->get();

        return [
            'items' => $rows->take(self::DELIVERIES_PER_PAGE)
                ->map(fn (ManagerNotificationDelivery $d) => $this->serializeDelivery($d))
                ->values(),
            'has_more' => $rows->count() > self::DELIVERIES_PER_PAGE,
        ];
    }

    private function serializeDelivery(ManagerNotificationDelivery $delivery): array
    {
        return [
            'id' => $delivery->id,
            'created_at' => $delivery->created_at?->toISOString(),
            'trigger' => $delivery->trigger,
            'sequence' => $delivery->sequence,
            'brand' => $delivery->brand ? ['id' => $delivery->brand->id, 'name' => $delivery->brand->name] : null,
            'user' => $delivery->user ? ['name' => $this->userName($delivery->user), 'email' => $delivery->user->email] : null,
            'sent_by' => $delivery->sentBy ? $this->userName($delivery->sentBy) : null,
            'email' => $delivery->emailMessage
                ? ['id' => $delivery->emailMessage->id, 'status' => $delivery->emailMessage->status->value]
                : null,
        ];
    }

    private function serialize(ManagerNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'key' => $notification->key,
            'name' => $notification->name,
            'description' => $notification->description,
            'conditions' => $notification->conditions,
            'send_hour' => $notification->send_hour,
            'enabled' => $notification->enabled,
        ];
    }

    /**
     * Письмо с тестовыми данными, собранное тем же шаблоном и payload,
     * что и при настоящей отправке. В базу ничего не пишется.
     */
    private function preview(ManagerNotification $notification, EmailSender $sender): ?string
    {
        $handler = $this->registry->handler($notification);

        $message = new EmailMessage([
            'template_key' => $handler->template(),
            'subject' => $handler->subject(),
            'to_email' => 'manager@example.com',
            'to_name' => 'Анна',
            'locale' => 'ru',
            'payload' => $this->dispatcher->payload($notification, 'Анна', 'Ваш бренд'),
        ]);

        try {
            return $sender->renderHtml($message);
        } catch (Throwable $e) {
            report($e);

            return null;
        }
    }

    private function userName(?User $user): ?string
    {
        if (! $user) {
            return null;
        }

        return trim(($user->first_name ?? '').' '.($user->last_name ?? '')) ?: $user->email;
    }
}
