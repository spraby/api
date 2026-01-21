<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\BrandRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BrandRequestController extends Controller
{
    /**
     * Show the brand requests list page.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', BrandRequest::class);
        $brandRequests = BrandRequest::with(['brand', 'user', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'name' => $request->name,
                    'brand_name' => $request->brand_name,
                    'status' => $request->status,
                    'brand_id' => $request->brand_id,
                    'user_id' => $request->user_id,
                    'rejection_reason' => $request->rejection_reason,
                    'reviewed_by' => $request->reviewed_by,
                    'approved_at' => $request->approved_at?->toISOString(),
                    'rejected_at' => $request->rejected_at?->toISOString(),
                    'created_at' => $request->created_at->toISOString(),
                    'updated_at' => $request->updated_at->toISOString(),
                    'brand' => $request->brand ? [
                        'id' => $request->brand->id,
                        'name' => $request->brand->name,
                    ] : null,
                    'user' => $request->user ? [
                        'id' => $request->user->id,
                        'email' => $request->user->email,
                        'first_name' => $request->user->first_name,
                        'last_name' => $request->user->last_name,
                    ] : null,
                    'reviewer' => $request->reviewer ? [
                        'id' => $request->reviewer->id,
                        'email' => $request->reviewer->email,
                        'first_name' => $request->reviewer->first_name,
                        'last_name' => $request->reviewer->last_name,
                    ] : null,
                ];
            });

        return Inertia::render('BrandRequests', [
            'brandRequests' => $brandRequests,
        ]);
    }

    /**
     * Show a single brand request.
     */
    public function show(BrandRequest $brandRequest): Response
    {
        $this->authorize('view', $brandRequest);

        $brandRequest->load(['brand', 'user', 'reviewer']);

        $data = [
            'id' => $brandRequest->id,
            'email' => $brandRequest->email,
            'phone' => $brandRequest->phone,
            'name' => $brandRequest->name,
            'brand_name' => $brandRequest->brand_name,
            'status' => $brandRequest->status,
            'brand_id' => $brandRequest->brand_id,
            'user_id' => $brandRequest->user_id,
            'rejection_reason' => $brandRequest->rejection_reason,
            'reviewed_by' => $brandRequest->reviewed_by,
            'approved_at' => $brandRequest->approved_at?->toISOString(),
            'rejected_at' => $brandRequest->rejected_at?->toISOString(),
            'created_at' => $brandRequest->created_at->toISOString(),
            'updated_at' => $brandRequest->updated_at->toISOString(),
            'brand' => $brandRequest->brand ? [
                'id' => $brandRequest->brand->id,
                'name' => $brandRequest->brand->name,
            ] : null,
            'user' => $brandRequest->user ? [
                'id' => $brandRequest->user->id,
                'email' => $brandRequest->user->email,
                'first_name' => $brandRequest->user->first_name,
                'last_name' => $brandRequest->user->last_name,
            ] : null,
            'reviewer' => $brandRequest->reviewer ? [
                'id' => $brandRequest->reviewer->id,
                'email' => $brandRequest->reviewer->email,
                'first_name' => $brandRequest->reviewer->first_name,
                'last_name' => $brandRequest->reviewer->last_name,
            ] : null,
        ];

        return Inertia::render('BrandRequestShow', [
            'brandRequest' => $data,
        ]);
    }

    /**
     * Approve a brand request.
     */
    public function approve(BrandRequest $brandRequest): RedirectResponse
    {
        $this->authorize('update', $brandRequest);

        if (! $brandRequest->isPending()) {
            return redirect()->back()->with('error', 'This request has already been processed.');
        }

        DB::transaction(function () use ($brandRequest) {
            // Find or create user with manager role
            $user = User::where('email', $brandRequest->email)->first();

            if (! $user) {
                $user = User::create([
                    'email' => $brandRequest->email,
                    'phone' => $brandRequest->phone,
                    'first_name' => $brandRequest->name,
                    'password' => Hash::make(Str::random(16)),
                ]);
            }

            // Assign manager role if not already assigned
            if (! $user->hasRole(User::ROLES['MANAGER'])) {
                $user->assignRole(User::ROLES['MANAGER']);
            }

            // Create brand
            $brand = Brand::create([
                'user_id' => $user->id,
                'name' => $brandRequest->brand_name ?? $brandRequest->email,
            ]);

            // Update brand request
            $brandRequest->update([
                'status' => BrandRequest::STATUS_APPROVED,
                'user_id' => $user->id,
                'brand_id' => $brand->id,
                'reviewed_by' => auth()->id(),
                'approved_at' => now(),
            ]);
        });

        return redirect()->back()->with('success', 'Brand request approved successfully.');
    }

    /**
     * Reject a brand request.
     */
    public function reject(Request $request, BrandRequest $brandRequest): RedirectResponse
    {
        $this->authorize('update', $brandRequest);

        if (! $brandRequest->isPending()) {
            return redirect()->back()->with('error', 'This request has already been processed.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        $brandRequest->update([
            'status' => BrandRequest::STATUS_REJECTED,
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'reviewed_by' => auth()->id(),
            'rejected_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Brand request rejected.');
    }
}