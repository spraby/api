@php
    /**
    * @var \App\Models\Customer|null $customer
    * @var string|null $label
    */
    $state = $getState();
    $customer = $state['customer'] ?? null;
    $label = $state['label'] ?? null;
@endphp

<div class="flex flex-col gap-5 rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10 px-6 py-4">
    <div class="flex items-center justify-between">
        @if($label)
            <h3 class="text-lg font-semibold text-gray-900">{{$label}}</h3>
        @endif
        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
        </div>
    </div>

    <div>
        {{$customer->name}}
    </div>

    <div class="space-y-4">
        @if($customer?->email)
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Email</span>
                <div class="flex items-start justify-end gap-1">
                    <a href="mailto:{{ $customer->email }}"
                       class="text-sm font-medium text-blue-600 hover:text-blue-800 truncate max-w-[150px]"
                       title="{{ $customer->email }}">
                        {{ $customer->email }}
                    </a>
                    <x-copyable :text="$customer->email ?? ''" />
                </div>
            </div>
        @endif

        @if($customer?->phone)
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Phone</span>
                <div class="flex items-start justify-end gap-1">
                    <a href="tel:{{ $customer->phone }}"
                       class="text-sm font-medium text-blue-600 hover:text-blue-800">
                        {{ $customer->phone }}
                    </a>
                    <x-copyable :text="$customer->phone ?? ''" />
                </div>
            </div>
        @endif
    </div>
</div>
