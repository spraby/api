<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOnboardingRequest;
use App\Models\User;
use App\Services\AdminOnboardingService;
use Illuminate\Http\JsonResponse;

class AdminOnboardingController extends Controller
{
    public function update(
        UpdateOnboardingRequest $request,
        AdminOnboardingService $onboarding,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'onboarding' => $onboarding->update(
                $user,
                $request->string('action')->toString(),
                $request->string('step')->toString() ?: null,
            ),
        ]);
    }
}
