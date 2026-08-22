<?php

namespace App\Http\Middleware;

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
