@php
    /**
    * @var \App\Models\Customer|null $customer
    * @var string|null $label
    */
    $state = $getState();
    $customer = $state['customer'] ?? null;
    $label = $state['label'] ?? null;
@endphp

<div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
        @if($label)
            <h3 class="text-lg font-semibold text-gray-900">{{$label}}</h3>
        @endif
        <div class="w-10 h-10 bg-green-100 dark:bg-green-600 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600 dark:text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
        </div>
    </div>

    <div class="dark:text-white text-lg font-semibold">
        {{$customer->name}}
    </div>

    <div class="space-y-4">
        @php($data = [['label' => 'Email', 'value' => $customer?->email ?? null], ['label' => 'Phone', 'value' => $customer?->phone ?? null]])
        @foreach($data as $item)
            <div class="flex items-center justify-between">
                <span class="text-sm dark:text-white text-gray-500">{{$item['label']}}</span>
                <div class="flex items-start justify-end gap-1">
                    <a href="mailto:{{ $item['value'] }}"
                       class="text-sm font-medium text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-300 truncate max-w-[150px]"
                       title="{{ $item['value'] }}">
                        {{ $item['value'] }}
                    </a>
                    <x-copyable :text="$item['value'] ?? ''"/>
                </div>
            </div>
        @endforeach
    </div>
</div>
