@php
    /**
    * @var \App\Models\Order|null $order
    */
    $state = $getState();
    $order = $state['order'];
@endphp

<div class="space-y-2">
    @forelse($order->audits()->latest()->get() as $audit)
        @if($audit->message)
            <div class="flex items-start gap-3 p-2">
                <div class="flex-1 min-w-0">
                    <div class="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {{ $audit->message }}
                    </div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {{ $audit->created_at->format('d.m.Y H:i') }}
                </div>
            </div>
        @endif
    @empty
        <div class="text-center py-4 text-gray-500 dark:text-gray-400">
            Нет записей аудита
        </div>
    @endforelse
</div>
