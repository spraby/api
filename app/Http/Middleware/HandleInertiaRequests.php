<?php

namespace App\Http\Middleware;

use App\Models\CategoryRequest;
use App\Models\ModerationRequest;
use App\Models\User;
use App\Services\AdminOnboardingService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'admin';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        /** @var User|null $user */
        $user = $request->user();
        $impersonatorId = $request->session()->get('impersonator_id');
        $impersonator = null;

        if ($impersonatorId) {
            $impersonatorUser = \App\Models\User::find($impersonatorId);
            if ($impersonatorUser) {
                $impersonator = [
                    'id' => $impersonatorUser->id,
                    'name' => $impersonatorUser->first_name.' '.$impersonatorUser->last_name,
                    'email' => $impersonatorUser->email,
                ];
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                    'is_admin' => $user->isAdmin(),
                    'is_manager' => $user->isManager(),
                ] : null,
                'impersonator' => $impersonator,
            ],
            'onboarding' => fn () => $this->onboarding($user),
            'navCounts' => fn () => $this->navCounts($user),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'locale' => app()->getLocale(),
            'lang' => syncLangFiles(['admin']),
        ];
    }

    /**
     * Счётчики для бейджей в меню. Считаем только то, что пользователю
     * реально видно, — иначе на каждой странице админки уходили бы
     * лишние запросы ради скрытых пунктов.
     *
     * @return array<string, int>
     */
    private function navCounts(?User $user): array
    {
        if (! $user) {
            return [];
        }

        $counts = [];

        if ($user->can(User::PERMISSIONS['READ_CATEGORY_REQUESTS']) && $user->can(User::PERMISSIONS['WRITE_CATEGORIES'])) {
            $counts['category_requests'] = CategoryRequest::query()
                ->where('status', CategoryRequest::STATUS_PENDING)
                ->count();
        }

        if ($user->can(User::PERMISSIONS['READ_MODERATION_REQUESTS'])) {
            $counts['brand_page_requests'] = ModerationRequest::query()
                ->fromBrands()
                ->where('status', ModerationRequest::STATUS_PENDING)
                ->count();
        }

        return $counts;
    }

    private function onboarding(?User $user): ?array
    {
        if (! $user?->isManager()) {
            return null;
        }

        // Туториал скрыт навсегда — не считаем состояние (5 коррелированных
        // подзапросов + выборка заявок) на каждой странице админки впустую.
        if ($user->onboarding_dismissed_at) {
            return null;
        }

        $onboarding = app(AdminOnboardingService::class);

        return $onboarding->build($user, $onboarding->findBrand($user));
    }
}
