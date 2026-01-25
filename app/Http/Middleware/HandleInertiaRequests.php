<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the root view.
     */
    public function rootView(Request $request): string
    {
        // Use react-admin view for /sb/admin routes
        if ($request->is('sb/admin*')) {
            return 'admin';
        }

        return $this->rootView;
    }

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
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'first_name' => $request->user()->first_name,
                    'last_name' => $request->user()->last_name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                    'is_admin' => $request->user()->isAdmin(),
                    'is_manager' => $request->user()->isManager(),
                ] : null,
                'impersonator' => $impersonator,
            ],
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
}
