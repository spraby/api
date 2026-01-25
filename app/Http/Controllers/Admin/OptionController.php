<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOptionRequest;
use App\Http\Requests\UpdateOptionRequest;
use App\Models\Option;
use App\Models\OptionValue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class OptionController extends Controller
{
    /**
     * Show the options list page.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Option::class);

        $options = Option::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($option) {
                return [
                    'id' => $option->id,
                    'name' => $option->name,
                    'title' => $option->title,
                    'description' => $option->description,
                    'values_count' => $option->values()->count(),
                    'created_at' => $option->created_at->toISOString(),
                ];
            });

        return Inertia::render('Options', [
            'options' => $options,
        ]);
    }

    /**
     * Show the form for creating a new option.
     */
    public function create(): Response
    {
        $this->authorize('create', Option::class);

        return Inertia::render('OptionCreate', [
            'option' => [
                'name' => '',
                'title' => '',
                'description' => '',
                'values' => [],
            ],
        ]);
    }

    /**
     * Store a newly created option.
     */
    public function store(StoreOptionRequest $request): RedirectResponse
    {
        $this->authorize('create', Option::class);

        try {
            $option = Option::create([
                'name' => $request->input('name'),
                'title' => $request->input('title'),
                'description' => $request->input('description'),
            ]);

            // Create values
            $values = $request->input('values', []);
            foreach ($values as $index => $valueData) {
                if (!empty($valueData['value'])) {
                    $option->values()->create([
                        'value' => $valueData['value'],
                        'position' => $index,
                    ]);
                }
            }

            return redirect()->route('sb.admin.options.edit', $option->id)
                ->with('success', 'Option created successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to create option: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified option.
     */
    public function edit(Option $option): Response
    {
        $this->authorize('view', Option::class);

        $option->load(['values' => function ($query) {
            $query->orderBy('position');
        }]);

        return Inertia::render('OptionEdit', [
            'option' => [
                'id' => $option->id,
                'name' => $option->name,
                'title' => $option->title,
                'description' => $option->description,
                'values' => $option->values->map(function ($value) {
                    return [
                        'id' => $value->id,
                        'value' => $value->value,
                        'position' => $value->position,
                    ];
                })->toArray(),
                'created_at' => $option->created_at->toISOString(),
                'updated_at' => $option->updated_at->toISOString(),
            ],
        ]);
    }

    /**
     * Update the specified option.
     */
    public function update(UpdateOptionRequest $request, Option $option): RedirectResponse
    {
        $this->authorize('update', Option::class);

        try {
            $option->update([
                'name' => $request->input('name'),
                'title' => $request->input('title'),
                'description' => $request->input('description'),
            ]);

            // Sync values
            $submittedValues = $request->input('values', []);
            $existingValueIds = $option->values()->pluck('id')->toArray();
            $submittedValueIds = [];

            foreach ($submittedValues as $index => $valueData) {
                if (empty($valueData['value'])) {
                    continue;
                }

                if (isset($valueData['id']) && in_array($valueData['id'], $existingValueIds)) {
                    // Update existing value
                    OptionValue::where('id', $valueData['id'])->update([
                        'value' => $valueData['value'],
                        'position' => $index,
                    ]);
                    $submittedValueIds[] = $valueData['id'];
                } else {
                    // Create new value
                    $newValue = $option->values()->create([
                        'value' => $valueData['value'],
                        'position' => $index,
                    ]);
                    $submittedValueIds[] = $newValue->id;
                }
            }

            // Delete removed values
            $valuesToDelete = array_diff($existingValueIds, $submittedValueIds);
            if (!empty($valuesToDelete)) {
                OptionValue::whereIn('id', $valuesToDelete)->delete();
            }

            return Redirect::route('sb.admin.options.edit', $option->id)
                ->with('success', 'Option updated successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to update option: ' . $e->getMessage());
        }
    }

    /**
     * Delete the specified option.
     */
    public function destroy(Option $option): RedirectResponse
    {
        $this->authorize('delete', Option::class);

        try {
            $option->delete();

            return Redirect::route('sb.admin.options')->with('success', 'Option deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to delete option: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete options.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $this->authorize('delete', Option::class);

        $request->validate([
            'option_ids' => 'required|array',
            'option_ids.*' => 'required|integer|exists:options,id',
        ]);

        try {
            Option::whereIn('id', $request->input('option_ids'))->delete();

            return Redirect::route('sb.admin.options')->with('success', 'Options deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Failed to delete options: ' . $e->getMessage());
        }
    }
}
