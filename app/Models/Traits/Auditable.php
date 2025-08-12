<?php

namespace App\Models\Traits;

use App\Models\Audit;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            $model->audit('created');
        });

        static::updated(function ($model) {
            $model->audit('updated');
        });

        static::deleted(function ($model) {
            $model->audit('deleted');
        });
    }

    public function audit($event, $message = null): void
    {
        $oldValues = $newValues = null;
        $autoMessage = null;

        if ($event === 'updated') {
            $oldValues = $this->getOriginal();
            $newValues = $this->getChanges();
            $autoMessage = $this->generateUpdateMessage($oldValues, $newValues);
        } elseif ($event === 'created') {
            $newValues = $this->getAttributes();
            $autoMessage = 'Created a new record.';
        } elseif ($event === 'deleted') {
            $autoMessage = 'Record has been deleted.';
        }

        Audit::query()->create([
            'event' => $event,
            'message' => $message ?? $autoMessage,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'auditable_id' => $this->getKey(),
            'auditable_type' => get_class($this),
            'user_id' => Auth::id(),
        ]);
    }

    protected function generateUpdateMessage($oldValues, $changes): string
    {
        $messages = [];
        $ignoreFields = ['updated_at', 'created_at'];

        foreach ($changes as $field => $newValue) {
            if (in_array($field, $ignoreFields)) {
                continue;
            }

            $oldValue = $oldValues[$field] ?? null;
            $fieldName = Str::headline($field);

            if (is_null($oldValue)) {
                $messages[] = "Added {$fieldName}: {$newValue}";
            } elseif (is_null($newValue)) {
                $messages[] = "Removed {$fieldName}";
            } else {
                $messages[] = "Updated {$fieldName} с {$oldValue} на {$newValue}";
            }
        }

        return implode(', ', $messages) ?: 'Updated system fields';
    }

    public function audits(): MorphMany
    {
        return $this->morphMany(Audit::class, 'auditable');
    }
}
